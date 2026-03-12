import { z } from "zod";

export const createUserSchema = z.object({
	password: z.string().min(8, "password must be at least 8 characters long"),
	username: z.string().min(1, "username cannot be empty"),
});

export const loginSchema = createUserSchema;
