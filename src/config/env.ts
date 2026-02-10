import z from 'zod'

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const containsLocalhost = (origin: string): boolean => {
  return origin.includes('localhost') || origin.includes('127.0.0.1')
}

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
  CORS_ORIGINS: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (val === undefined) return true
        const origins = val.split(',').map((o) => o.trim())
        return origins.every((origin) => isValidUrl(origin))
      },
      {
        message: 'Each CORS origin must be a valid URL',
      }
    ),
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

const parsedEnv = envSchema.parse(process.env)

const env = {
  ...parsedEnv,
  CORS_ORIGINS:
    parsedEnv.CORS_ORIGINS ??
    (parsedEnv.NODE_ENV === 'production' ? '' : 'http://localhost:5173'),
}

if (parsedEnv.NODE_ENV === 'production' && !env.CORS_ORIGINS) {
  throw new Error('CORS_ORIGINS is required in production')
}

if (parsedEnv.NODE_ENV === 'production' && parsedEnv.CORS_ORIGINS) {
  const origins = parsedEnv.CORS_ORIGINS.split(',').map((o) => o.trim())
  const hasLocalhost = origins.some(containsLocalhost)
  if (hasLocalhost) {
    console.warn(
      '[WARNING] CORS_ORIGINS contains localhost in production! This may cause CORS failures. Set CORS_ORIGINS to production URLs.'
    )
  }
}

export default env
