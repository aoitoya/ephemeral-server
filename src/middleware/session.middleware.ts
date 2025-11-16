import connectPgSimple from 'connect-pg-simple'
import session from 'express-session'
import { Pool } from 'pg'

import env from '../config/env.js'

const PgSession = connectPgSimple(session)

export const pgPool = new Pool({
  connectionString: env.DATABASE_URL,
})

export const sessionMiddleware = session({
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
  },
  resave: false,
  saveUninitialized: false,
  secret: env.SESSION_SECRET,
  store: new PgSession({
    createTableIfMissing: true,
    pool: pgPool,
    tableName: 'session',
  }),
})
