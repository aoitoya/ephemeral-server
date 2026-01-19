import { faker } from '@faker-js/faker'
import supertest from 'supertest'
import { beforeAll, describe, expect, test } from 'vitest'

import app from '../../src/app.js'
import { PostCreateRespones, UserResponse } from './types.js'

const getAuthenticatedAgent = async () => {
  const testUser = {
    password: faker.internet.password({}),
    username: faker.internet.username(),
  }

  const agent = supertest.agent(app)
  await agent.post('/api/v1/users/register').send(testUser)
  const res = await agent.post('/api/v1/users/login').send(testUser)
  const body = res.body as UserResponse
  if (typeof body.token === 'string') {
    agent.set('Authorization', `Bearer ${body.token}`)
  } else {
    throw new Error('Login response missing valid token')
  }
  const cookies: unknown = res.headers['set-cookie']
  if (cookies && Array.isArray(cookies)) {
    const cookieArray = cookies as string[]
    const csrfCookie: string | undefined = cookieArray.find((cookie: string) =>
      cookie.startsWith('XSRF-TOKEN=')
    )
    if (csrfCookie) {
      const parts: string[] = csrfCookie.split('=')
      if (parts.length > 1) {
        const csrfToken = parts[1].split(';')[0] ?? ''

        agent.set('x-xsrf-token', csrfToken)
      }
    }
  }
  return agent
}

describe('Posts Endpoints', () => {
  let agent: supertest.Agent

  beforeAll(async () => {
    agent = await getAuthenticatedAgent()
  })

  describe('POST /', () => {
    test('should create a new post', async () => {
      const post = {
        content: faker.lorem.sentence(),
        topics: [faker.lorem.word(), faker.lorem.word()],
      }

      const res = await agent.post('/api/v1/posts').send(post)

      const body = res.body as PostCreateRespones

      expect(res.status).toBe(201)
      expect(body).toHaveProperty('id')
      expect(body).toHaveProperty('createdAt')
      expect(body).toHaveProperty('content', post.content)
      expect(body).toHaveProperty('topics')
      expect(body.topics).toEqual(expect.arrayContaining(post.topics))
    })

    test('should create a post with single topic', async () => {
      const post = {
        content: faker.lorem.sentence(),
        topics: [faker.lorem.word()],
      }

      const res = await agent.post('/api/v1/posts').send(post)

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('id')
      expect(res.body).toHaveProperty('content', post.content)
    })

    test('should return error when not authenticated', async () => {
      const res = await supertest(app).post('/api/v1/posts')
      expect(res.status).toBe(403)
    })

    test('should return error with no payload', async () => {
      const res = await agent.post('/api/v1/posts')

      expect(res.status).toBe(400)
    })

    test('should return error when content is missing', async () => {
      const res = await agent
        .post('/api/v1/posts')
        .send({ topics: [faker.lorem.word()] })

      expect(res.status).toBe(400)
    })

    test('should return error when content is empty', async () => {
      const res = await agent
        .post('/api/v1/posts')
        .send({ content: '', topics: [faker.lorem.word()] })

      expect(res.status).toBe(400)
    })

    test('should return error when topics array is empty', async () => {
      const res = await agent
        .post('/api/v1/posts')
        .send({ content: faker.lorem.sentence(), topics: [] })

      expect(res.status).toBe(400)
    })

    test('should return error when topics contain empty strings', async () => {
      const res = await agent
        .post('/api/v1/posts')
        .send({ content: faker.lorem.sentence(), topics: [''] })

      expect(res.status).toBe(400)
    })
  })

  describe('GET /', () => {
    test('should get all posts', async () => {
      const res = await agent.get('/api/v1/posts')
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    test('should get posts without authentication', async () => {
      const res = await supertest(app).get('/api/v1/posts')
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })
  })

  describe('POST /comments', () => {
    let createdPostId: string

    beforeAll(async () => {
      const post = {
        content: faker.lorem.sentence(),
        topics: [faker.lorem.word()],
      }
      const res = await agent.post('/api/v1/posts').send(post)
      const body = res.body as PostCreateRespones
      createdPostId = body.id
    })

    test('should create a comment on a post', async () => {
      const comment = {
        content: faker.lorem.sentence(),
        postId: createdPostId,
      }

      const res = await agent.post('/api/v1/posts/comments').send(comment)

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('id')
      expect(res.body).toHaveProperty('content', comment.content)
      expect(res.body).toHaveProperty('postId', comment.postId)
    })

    test('should return error when not authenticated', async () => {
      const res = await supertest(app).post('/api/v1/posts/comments')
      expect(res.status).toBe(403)
    })

    test('should return error with no payload', async () => {
      const res = await agent.post('/api/v1/posts/comments')

      expect(res.status).toBe(400)
    })

    test('should return error when content is missing', async () => {
      const res = await agent
        .post('/api/v1/posts/comments')
        .send({ postId: createdPostId })

      expect(res.status).toBe(400)
    })

    test('should return error when both postId and commentId are provided', async () => {
      const res = await agent.post('/api/v1/posts/comments').send({
        commentId: 'some-comment-id',
        content: faker.lorem.sentence(),
        postId: createdPostId,
      })

      expect(res.status).toBe(400)
    })

    test('should return error when neither postId nor commentId are provided', async () => {
      const res = await agent
        .post('/api/v1/posts/comments')
        .send({ content: faker.lorem.sentence() })

      expect(res.status).toBe(400)
    })
  })

  describe('GET /comments', () => {
    let createdPostId: string
    let createdCommentId: string

    beforeAll(async () => {
      const post = {
        content: faker.lorem.sentence(),
        topics: [faker.lorem.word()],
      }
      const postRes = await agent.post('/api/v1/posts').send(post)
      const postResBody = postRes.body as PostCreateRespones
      createdPostId = postResBody.id

      const comment = {
        content: faker.lorem.sentence(),
        postId: createdPostId,
      }
      const commentRes = await agent
        .post('/api/v1/posts/comments')
        .send(comment)

      const commentResBody = commentRes.body as { id: string }

      createdCommentId = commentResBody.id
    })

    test('should get comments for a post', async () => {
      const res = await agent
        .get('/api/v1/posts/comments')
        .query({ postId: createdPostId })

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    test('should get comment replies', async () => {
      const res = await agent
        .get('/api/v1/posts/comments')
        .query({ commentId: createdCommentId })

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    test('should return error when neither postId nor commentId are provided', async () => {
      const res = await agent.get('/api/v1/posts/comments')
      expect(res.status).toBe(400)
    })

    test('should get comments without authentication', async () => {
      const res = await supertest(app)
        .get('/api/v1/posts/comments')
        .query({ postId: createdPostId })

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })
  })

  describe('POST /vote', () => {
    let createdPostId: string
    let createdCommentId: string

    beforeAll(async () => {
      const post = {
        content: faker.lorem.sentence(),
        topics: [faker.lorem.word()],
      }
      const postRes = await agent.post('/api/v1/posts').send(post)

      const postResBody = postRes.body as PostCreateRespones

      createdPostId = postResBody.id

      const comment = {
        content: faker.lorem.sentence(),
        postId: createdPostId,
      }
      const commentRes = await agent
        .post('/api/v1/posts/comments')
        .send(comment)

      const commentResBody = commentRes.body as { id: string }

      createdCommentId = commentResBody.id
    })

    test('should upvote a post of different user', async () => {
      const agent = await getAuthenticatedAgent()

      const vote = {
        postId: createdPostId,
        type: 'upvote',
      }

      const res = await agent.post('/api/v1/posts/vote').send(vote)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('id')
    })

    test('should not upvote their own post', async () => {
      const vote = {
        postId: createdPostId,
        type: 'upvote',
      }

      const res = await agent.post('/api/v1/posts/vote').send(vote)

      expect(res.status).toBe(403)
    })

    test('should downvote a post of different user', async () => {
      const agent = await getAuthenticatedAgent()

      const vote = {
        postId: createdPostId,
        type: 'downvote',
      }

      const res = await agent.post('/api/v1/posts/vote').send(vote)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('id')
    })

    test('should not downvote their own post', async () => {
      const vote = {
        postId: createdPostId,
        type: 'downvote',
      }

      const res = await agent.post('/api/v1/posts/vote').send(vote)

      expect(res.status).toBe(403)
    })

    test('should upvote a comment of different user', async () => {
      const agent = await getAuthenticatedAgent()

      const vote = {
        commentId: createdCommentId,
        type: 'upvote',
      }

      const res = await agent.post('/api/v1/posts/vote').send(vote)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('id')
    })

    test('should not upvote their own comment', async () => {
      const vote = {
        commentId: createdCommentId,
        type: 'upvote',
      }

      const res = await agent.post('/api/v1/posts/vote').send(vote)

      expect(res.status).toBe(403)
    })

    test('should downvote a comment of different user', async () => {
      const agent = await getAuthenticatedAgent()

      const vote = {
        commentId: createdCommentId,
        type: 'downvote',
      }

      const res = await agent.post('/api/v1/posts/vote').send(vote)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('id')
    })

    test('should not downvote their own comment', async () => {
      const vote = {
        commentId: createdCommentId,
        type: 'downvote',
      }

      const res = await agent.post('/api/v1/posts/vote').send(vote)

      expect(res.status).toBe(403)
    })

    test('should return error when not authenticated', async () => {
      const res = await supertest(app).post('/api/v1/posts/vote')
      expect(res.status).toBe(403)
    })

    test('should return error with no payload', async () => {
      const res = await agent.post('/api/v1/posts/vote')

      expect(res.status).toBe(400)
    })

    test('should return error when type is missing', async () => {
      const res = await agent
        .post('/api/v1/posts/vote')
        .send({ postId: createdPostId })

      expect(res.status).toBe(400)
    })

    test('should return error when type is invalid', async () => {
      const res = await agent
        .post('/api/v1/posts/vote')
        .send({ postId: createdPostId, type: 'invalid' })

      expect(res.status).toBe(400)
    })

    test('should return error when both postId and commentId are provided', async () => {
      const res = await agent.post('/api/v1/posts/vote').send({
        commentId: createdCommentId,
        postId: createdPostId,
        type: 'upvote',
      })

      expect(res.status).toBe(400)
    })

    test('should return error when neither postId nor commentId are provided', async () => {
      const res = await agent
        .post('/api/v1/posts/vote')
        .send({ type: 'upvote' })

      expect(res.status).toBe(400)
    })
  })
})
