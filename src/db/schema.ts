import { relations, sql } from 'drizzle-orm'
import {
  AnyPgColumn,
  boolean,
  char,
  check,
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  isOnline: boolean('is_online'),
  lastOnline: timestamp('last_online'),
  password: text('password').notNull(),
  username: text('username').notNull(),
})

export const posts = pgTable('posts', {
  content: text('content').notNull(),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  downvotes: integer('downvotes').notNull().default(0),
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  topics: text('topics').array().notNull(),
  upvotes: integer('upvotes').notNull().default(0),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
})

export const comments = pgTable(
  'comments',
  {
    commentId: uuid('comment_id').references((): AnyPgColumn => comments.id, {
      onDelete: 'cascade',
    }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    downvotes: integer('downvotes').notNull().default(0),
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }),
    upvotes: integer('upvotes').notNull().default(0),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    check(
      'comments_post_xor_comment',
      sql`((${table.postId} IS NULL) <> (${table.commentId} IS NULL))`
    ),
  ]
)

export const voteTypeEnum = pgEnum('vote_type', ['upvote', 'downvote'])

export const votes = pgTable(
  'votes',
  {
    commentId: uuid('comment_id').references(() => comments.id, {
      onDelete: 'cascade',
    }),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }),
    type: voteTypeEnum('type').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    check(
      'votes_post_xor_comment',
      sql`((${table.postId} IS NULL) <> (${table.commentId} IS NULL))`
    ),
  ]
)

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    deviceInfo: text('device_info'),
    expiresAt: timestamp('expires_at').notNull(),
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    issuedAt: timestamp('issued_at').defaultNow().notNull(),
    revoked: boolean('revoked').default(false).notNull(),
    tokenHash: char('token_hash', { length: 64 }).notNull().unique(),
    userId: uuid('user_id').notNull(),
  },
  (table) => [
    index('idx_refresh_user').on(table.userId),
    index('idx_refresh_expires').on(table.expiresAt),
  ]
)

export const session = pgTable('session', {
  expire: timestamp('expire'),
  sess: json('sess'),
  sid: varchar('sid').primaryKey(),
})

// Relations
export const userRelations = relations(users, ({ many }) => ({
  comments: many(comments),
  posts: many(posts),
}))

export const postRelations = relations(posts, ({ many, one }) => ({
  comments: many(comments),
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}))

export const commentRelations = relations(comments, ({ many, one }) => ({
  comments: many(comments),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}))

export type LoginUser = Pick<User, 'password' | 'username'>
export type NewPost = Omit<typeof posts.$inferInsert, 'createdAt' | 'id'>
export type NewUser = Omit<typeof users.$inferInsert, 'createdAt' | 'id'>

export type Post = typeof posts.$inferSelect
export type RefreshToken = typeof refreshTokens.$inferSelect
export type User = typeof users.$inferSelect
export type Vote = typeof votes.$inferSelect
