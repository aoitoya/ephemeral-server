import { sql } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  password: text('password').notNull(),
  username: text('username').notNull(),
})

export type LoginUser = Pick<User, 'password' | 'username'>
export type NewUser = Omit<typeof users.$inferInsert, 'createdAt' | 'id'>
export type User = typeof users.$inferSelect
