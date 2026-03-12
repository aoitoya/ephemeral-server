import { Router } from "express";

import { NotificationController } from "./notification.controller.js";

const notificationRouter = Router();
const notificationController = new NotificationController();

notificationRouter.get("/", notificationController.getNotifications);

export default notificationRouter;
