import type { NextFunction, Request, Response } from "express";
import { isbot } from "isbot";

const botMiddleware = (req: Request, _res: Response, next: NextFunction) => {
	const userAgent = req.headers["user-agent"] || "";
	const isBot = isbot(userAgent);

	if (isBot) {
		console.log(`[BOT] ${isBot}: ${req.method} ${req.path}`);
	}

	req.isBot = isBot;
	next();
};

declare global {
	namespace Express {
		interface Request {
			isBot: boolean | string;
		}
	}
}

export default botMiddleware;
