import { relations, sql } from 'drizzle-orm'
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

export const posts = pgTable('posts', {
  content: text('content').notNull(),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  topics: text('topics').array().notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}))

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}))

export type LoginUser = Pick<User, 'password' | 'username'>
export type NewPost = Omit<typeof posts.$inferInsert, 'createdAt' | 'id'>
export type NewUser = Omit<typeof users.$inferInsert, 'createdAt' | 'id'>

export type Post = typeof posts.$inferSelect
export type User = typeof users.$inferSelect
