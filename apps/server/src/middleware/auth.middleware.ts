import type {
	Request as ExpressRequest,
	NextFunction,
	Response,
} from "express";

export const authenticateToken = (
	req: ExpressRequest,
	res: Response,
	next: NextFunction,
) => {
	if (req.isBot) {
		return res
			.status(403)
			.json({ code: "BOT_DETECTED", message: "Bots are not allowed" });
	}

	const sessionUser = (
		req as ExpressRequest & {
			session: { user?: { id: string; username: string } };
		}
	).session.user;

	if (!sessionUser) {
		return res
			.status(401)
			.json({ code: "NO_SESSION", message: "Unauthorized: no session" });
	}

	const csrfHeader = req.header("x-xsrf-token");
	const csrfCookie = req.cookies["XSRF-TOKEN"] as string | undefined;

	if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
		return res
			.status(403)
			.json({ code: "CSRF_MISMATCH", message: "Forbidden" });
	}

	next();
};
