import { Router } from "express";

import { authenticateToken } from "../../middleware/auth.middleware.js";
import { authLimiter } from "../../middleware/rateLimit.middleware.js";
import { uploadImage } from "../../middleware/upload.middleware.js";
import MediaController from "./media.controller.js";

const mediaRouter = Router();
const mediaController = new MediaController();

mediaRouter.post(
	"/upload/image",
	authLimiter,
	authenticateToken,
	uploadImage.single("file"),
	mediaController.uploadImage,
);

mediaRouter.get("/:key", mediaController.downloadImage);

export default mediaRouter;
