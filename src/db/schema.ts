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

export const comments = pgTable('comments', {
  content: text('content').notNull(),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
})

export const commentReplies = pgTable('comment_replies', {
  commentId: uuid('comment_id')
    .notNull()
    .references(() => comments.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
})

// Relations
export const userRelations = relations(users, ({ many }) => ({
  commentReplies: many(commentReplies),
  comments: many(comments),
  posts: many(posts),
}))

export const postRelations = relations(posts, ({ many, one }) => ({
  commentReplies: many(commentReplies),
  comments: many(comments),
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}))

export const commentRelations = relations(comments, ({ many, one }) => ({
  commentReplies: many(commentReplies),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}))

export const commentReplyRelations = relations(commentReplies, ({ one }) => ({
  comment: one(comments, {
    fields: [commentReplies.commentId],
    references: [comments.id],
  }),
  user: one(users, {
    fields: [commentReplies.userId],
    references: [users.id],
  }),
}))

export type LoginUser = Pick<User, 'password' | 'username'>
export type NewPost = Omit<typeof posts.$inferInsert, 'createdAt' | 'id'>
export type NewUser = Omit<typeof users.$inferInsert, 'createdAt' | 'id'>

export type Post = typeof posts.$inferSelect
export type User = typeof users.$inferSelect
