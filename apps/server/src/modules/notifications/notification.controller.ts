import type { Request, Response } from "express";

import { AuthenticationError } from "../../shared/errors/index.js";
import { NotificationRepository } from "./notification.repository.js";

export class NotificationController {
	private readonly notificationRepository: NotificationRepository;

	constructor() {
		this.notificationRepository = new NotificationRepository();
	}

	getNotifications = async (req: Request, res: Response) => {
		const user = req.session.user;

		if (!user) {
			throw new AuthenticationError("No user id found");
		}

		const notifications = await this.notificationRepository.getNotifications(
			user.id,
		);

		res.json(notifications);
	};
}
