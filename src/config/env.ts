import dotenv from 'dotenv'
import z from 'zod'

dotenv.config({ quiet: true })

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .default('postgres://postgres:postgres@localhost:5432/postgres'),
  JWT_ACCESS_EXPIRES_IN: z
    .string()
    .regex(/^\d+$/, 'JWT expires in must be a number')
    .default('3600')
    .transform(Number),
  JWT_ACCESS_SECRET: z.string().default('secret'),
  NODE_ENV: z.string().default('development'),
  PORT: z
    .string()
    .regex(/^\d+$/, 'Port must be a numeric string')
    .default('3000')
    .transform(Number),
  REFRESH_EXPIRES_IN: z
    .string()
    .regex(/^\d+$/, 'JWT refresh expires in must be a number')
    .default('604800')
    .transform(Number),
})

const env = envSchema.parse(process.env)

export default env
