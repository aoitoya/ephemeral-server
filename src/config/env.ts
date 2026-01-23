import z from 'zod'

const envSchema = z.object({
  BCRYPT_ROUNDS: z
    .string()
    .regex(/^\d+$/, 'must be a numeric string')
    .transform(Number),
  DATABASE_URL: z.string(),
  JWT_ACCESS_EXPIRES_IN: z
    .string()
    .regex(/^\d+$/, 'must be a numeric string')
    .transform(Number),
  JWT_ACCESS_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().regex(/^\d+$/, 'must be a numeric string').transform(Number),
  REFRESH_EXPIRES_IN: z
    .string()
    .regex(/^\d+$/, 'must be a numeric string')
    .transform(Number),
  SESSION_SECRET: z.string().min(32),
})

const env = envSchema.parse(process.env)

export default env
