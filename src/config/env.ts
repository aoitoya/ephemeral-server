import dotenv from 'dotenv'
import z from 'zod'

dotenv.config({ quiet: true })

const defaultEnv = {
  DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/postgres',
  JWT_ACCESS_EXPIRES_IN: '3600',
  JWT_ACCESS_SECRET: 'dev_jwt_access_secret',
  NODE_ENV: 'development',
  PORT: '3000',
  REFRESH_EXPIRES_IN: '604800',
  SESSION_SECRET: 'dev_session_secret',
}

const envSchema = z
  .object({
    DATABASE_URL: z.string().default(defaultEnv.DATABASE_URL),
    JWT_ACCESS_EXPIRES_IN: z
      .string()
      .regex(/^\d+$/, 'JWT expires in must be a number')
      .default(defaultEnv.JWT_ACCESS_EXPIRES_IN)
      .transform(Number),
    JWT_ACCESS_SECRET: z.string().default(defaultEnv.JWT_ACCESS_SECRET),
    NODE_ENV: z.string().default(defaultEnv.NODE_ENV),
    PORT: z
      .string()
      .regex(/^\d+$/, 'Port must be a numeric string')
      .default(defaultEnv.PORT)
      .transform(Number),
    REFRESH_EXPIRES_IN: z
      .string()
      .regex(/^\d+$/, 'JWT refresh expires in must be a number')
      .default(defaultEnv.REFRESH_EXPIRES_IN)
      .transform(Number),
    SESSION_SECRET: z
      .string()
      .min(32, 'SESSION_SECRET must be at least 32 characters')
      .default(defaultEnv.SESSION_SECRET),
  })

  .refine(
    (env) =>
      env.NODE_ENV !== 'production' ||
      (env.JWT_ACCESS_SECRET !== defaultEnv.JWT_ACCESS_SECRET &&
        env.SESSION_SECRET !== defaultEnv.SESSION_SECRET),
    {
      message:
        'In production, JWT_ACCESS_SECRET and SESSION_SECRET must not use insecure defaults',
    }
  )

const env = envSchema.parse(process.env)

export default env
