import dotenv from 'dotenv'
import z from 'zod'

dotenv.config()

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .default('postgres://postgres:postgres@localhost:5432/postgres'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  JWT_SECRET: z.string().default('secret'),
  PORT: z
    .string()
    .regex(/^\d+$/, 'Port must be a numeric string')
    .default('3000')
    .transform(Number),
})

const env = envSchema.parse(process.env)

export default env
