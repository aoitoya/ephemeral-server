import z from 'zod'

const envSchema = z.object({
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_ENDPOINT: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  BCRYPT_ROUNDS: z
    .string()
    .regex(/^\d+$/, 'must be a numeric string')
    .transform(Number),
  CORS_ORIGINS: z.string().optional().default('http://localhost:5173'),
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
