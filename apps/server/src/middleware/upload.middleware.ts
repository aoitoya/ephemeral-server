import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import multer from "multer";

import {
	ALLOWED_MIME_TYPES,
	MAX_FILE_SIZE,
} from "../constants/media.constants.js";

const tempDir = join(tmpdir(), "ephemeral-uploads");
mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, tempDir);
	},
	filename: (_req, file, cb) => {
		const uniqueSuffix = `${String(Date.now())}-${randomUUID()}`;
		cb(null, `${uniqueSuffix}-${file.originalname}`);
	},
});

const fileFilter = (
	_req: Express.Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
) => {
	if (
		!ALLOWED_MIME_TYPES.includes(
			file.mimetype as (typeof ALLOWED_MIME_TYPES)[number],
		)
	) {
		cb(new Error("Invalid file type. Only images are allowed."));
		return;
	}
	cb(null, true);
};

export const uploadImage = multer({
	fileFilter,
	limits: { fileSize: MAX_FILE_SIZE },
	storage,
});
