import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { vi } from 'vitest'

import * as schema from '../src/db/schema.js'

const execAsync = promisify(exec)

process.env.NODE_ENV = 'test'
process.env.PORT = '3000'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.SESSION_SECRET = 'test_session_secret_32_characters_minimum'
process.env.BCRYPT_ROUNDS = '10'

vi.mock('../src/db/connection.js', async () => {
  const { stdout } = await execAsync('pnpm drizzle-kit export')

  const client = new PGlite()
  const db = drizzle(client, { schema })

  const sqlStatements = stdout
    .trim()
    .split(';')
    .filter((stmt) => stmt.trim())

  for (const stmt of sqlStatements) {
    await client.exec(stmt + ';')
  }

  return {
    db,
  }
})

vi.mock('../src/middleware/rateLimit.middleware.js', () => ({
  authLimiter: (_req: unknown, _res: unknown, next: () => void) => {
    next()
  },
  globalLimiter: (_req: unknown, _res: unknown, next: () => void) => {
    next()
  },
}))

vi.mock('pg', async () => {
  const { PGlite } = await import('@electric-sql/pglite')
  const sessionClient = new PGlite()
  await sessionClient.exec(`
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL,
      "sess" json NOT NULL,
      "expire" timestamp NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
    );
  `)
  class MockPool {
    end(): Promise<void> {
      return Promise.resolve()
    }
    query(text: string, params?: unknown[]): Promise<unknown> {
      return sessionClient.query(text, params)
    }
  }

  return {
    Pool: MockPool,
  }
})
