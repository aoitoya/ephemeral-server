import type { Server as HTTPServer } from "node:http";
import { Server } from "socket.io";

import env from "../config/env.js";

let io: null | Server = null;

export const userSocketMap = new Map<string, string>();

export function getIO(): Server {
	if (!io) {
		throw new Error("SocketService not initialized");
	}
	return io;
}

export function init(server: HTTPServer) {
	io ??= new Server(server, {
		cors: {
			allowedHeaders: ["Content-Type", "Authorization", "x-xsrf-token"],
			credentials: true,
			methods: ["GET", "POST", "OPTIONS"],
			origin: env.CORS_ORIGINS.split(",")
				.filter(Boolean)
				.map((e) => e.trim()),
		},
	});
	return io;
}
