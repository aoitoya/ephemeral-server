import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { unlink } from "node:fs/promises";
import { GetObjectCommand, NoSuchKey, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

import env from "../../config/env.js";
import logger from "../../config/logger.js";
import {
	ALLOWED_MIME_TYPES,
	MAX_FILE_SIZE,
} from "../../constants/media.constants.js";
import {
	DatabaseError,
	NotFoundError,
	ServiceUnavailableError,
	ValidationError,
} from "../../shared/errors/index.js";

let _s3Client: null | S3Client = null;

export class MediaService {
	async downloadImage(
		key: string,
	): Promise<{ contentType: string; stream?: ReadableStream }> {
		try {
			const response = await _getS3Client().send(
				new GetObjectCommand({
					Bucket: env.S3_BUCKET,
					Key: key,
				}),
			);

			const stream = response.Body?.transformToWebStream();
			const contentType = response.ContentType ?? this.getContentType(key);

			return { contentType, stream };
		} catch (error) {
			if (error instanceof NoSuchKey) {
				throw new NotFoundError("Image not found");
			}
			throw new DatabaseError("Failed to download image", error as Error);
		}
	}

	async uploadImage(file: Express.Multer.File): Promise<string> {
		if (
			!ALLOWED_MIME_TYPES.includes(
				file.mimetype as (typeof ALLOWED_MIME_TYPES)[number],
			)
		) {
			throw new ValidationError(
				`Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
			);
		}

		if (file.size > MAX_FILE_SIZE) {
			throw new ValidationError("File size exceeds 10MB limit");
		}

		const ext = file.mimetype.split("/")[1];
		const key = `${randomUUID()}.${ext}`;

		try {
			logger.info({ key }, "Starting image upload");

			const stream = createReadStream(file.path);

			const upload = new Upload({
				client: _getS3Client(),
				params: {
					Body: stream,
					Bucket: env.S3_BUCKET,
					ContentType: file.mimetype,
					Key: key,
				},
			});

			await upload.done();

			logger.info({ key }, "Image uploaded successfully");

			return key;
		} catch (error) {
			logger.error({ error, key }, "Failed to upload image");
			throw new DatabaseError("Failed to upload to S3", error as Error);
		} finally {
			try {
				await unlink(file.path);
			} catch (error) {
				logger.warn({ error }, "Failed to clean up temp file");
			}
		}
	}

	private getContentType(key: string): string {
		const extension = key.split(".").pop()?.toLowerCase();
		const validExtensions = new Set(["gif", "jpeg", "jpg", "png", "webp"]);

		if (!extension || !validExtensions.has(extension)) {
			return "application/octet-stream";
		}

		return `image/${extension === "jpg" ? "jpeg" : extension}`;
	}
}

function _getS3Client(): S3Client {
	if (!_s3Client) {
		if (
			!env.S3_ACCESS_KEY_ID ||
			!env.S3_SECRET_ACCESS_KEY ||
			!env.S3_REGION ||
			!env.S3_BUCKET
		) {
			throw new ServiceUnavailableError("Media service is not configured");
		}

		_s3Client = new S3Client({
			credentials: {
				accessKeyId: env.S3_ACCESS_KEY_ID,
				secretAccessKey: env.S3_SECRET_ACCESS_KEY,
			},
			endpoint: env.S3_ENDPOINT,
			forcePathStyle: true,
			region: env.S3_REGION,
		});
	}
	return _s3Client;
}

export default MediaService;
