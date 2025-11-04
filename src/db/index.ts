import { drizzle } from 'drizzle-orm/node-postgres'

import env from '../config/env'

const dbUri = env.DATABASE_URL

export const db = drizzle(dbUri)
