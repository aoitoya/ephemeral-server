import bcrypt from 'bcryptjs'

import env from '../config/env.js'
import logger from '../config/logger.js'
import { db } from './connection.js'
import { NewPost, NewUser } from './schema.js'
import { posts as postsTable, users as usersTable } from './schema.js'

async function seed() {
  logger.info('Starting database seeding...')

  const password = await bcrypt.hash('password', env.BCRYPT_ROUNDS)

  const users: NewUser[] = [
    {
      password,
      username: 'james',
    },
    {
      password,
      username: 'jane',
    },
    {
      password,
      username: 'richard',
    },
  ]

  const insertedUsers = await db.insert(usersTable).values(users).returning()

  const posts: NewPost[] = [
    {
      content:
        "Some days you just wake up tired for no clear reason, and that's okay. Rest is also progress.",
      topics: ['life', 'mental-health'],
      userId: insertedUsers[0].id,
    },
    {
      content:
        'Tried street food from a tiny cart today and it somehow tasted better than any restaurant meal.',
      topics: ['food', 'daily-life'],
      userId: insertedUsers[1].id,
    },
    {
      content:
        'Watching the sky change colors at sunset never gets old, no matter how many times I see it.',
      topics: ['nature', 'peace'],
      userId: insertedUsers[2].id,
    },
    {
      content:
        'Missed the last train and ended up walking home for an hour. Weirdly calming experience.',
      topics: ['life', 'city'],
      userId: insertedUsers[1].id,
    },
    {
      content:
        'Sometimes growth feels invisible, but looking back after a year makes everything clear.',
      topics: ['growth', 'reflection'],
      userId: insertedUsers[0].id,
    },
    {
      content:
        'There is something comforting about rainy evenings and warm lights through a window.',
      topics: ['rain', 'calm'],
      userId: insertedUsers[2].id,
    },
    {
      content:
        "I don't talk about it often, but today felt heavier than usual. Just needed to let it out somewhere.",
      topics: ['private', 'secret', 'emotions'],
      userId: insertedUsers[2].id,
    },
    {
      content:
        "Note to self: stop being so hard on yourself. You're trying, and that counts.",
      topics: ['private', 'self-talk'],
      userId: insertedUsers[1].id,
    },
    {
      content:
        'Got lost in a new neighborhood today and accidentally found the best coffee place ever.',
      topics: ['travel', 'explore'],
      userId: insertedUsers[0].id,
    },
    {
      content:
        'Long train rides make me think about life in ways nothing else really does.',
      topics: ['travel', 'thoughts'],
      userId: insertedUsers[1].id,
    },
  ]

  await db.insert(postsTable).values(posts)

  logger.info('Database seeding completed successfully')
}

seed().catch((error: unknown) => {
  logger.error('Error during seeding:', error)
  process.exit(1)
})
