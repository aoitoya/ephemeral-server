import { faker } from '@faker-js/faker'
import { eq } from 'drizzle-orm'
import supertest from 'supertest'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import app from '../../src/app.js'
import { db } from '../../src/db/connection.js'
import { users } from '../../src/db/schema.js'

interface TestUser {
  password: string
  username: string
}

const TestHelpers = {
  assertAuthError(response: supertest.Response): void {
    expect(response.status).toBe(401)
  },

  assertAuthSuccess(response: supertest.Response): void {
    expect(response.status).toBe(200)
    TestHelpers.assertUserResponse(response.body)
    TestHelpers.assertCookieStructure(response.headers['set-cookie'])
    TestHelpers.assertCookieNames(response.headers['set-cookie'])
  },

  assertCookieNames(cookies: string | string[]): void {
    const cookieArray = (Array.isArray(cookies) ? cookies : [cookies]).sort(
      (a, b) => a.localeCompare(b)
    )
    expect(cookieArray[0].split('=')[0]).toBe('connect.sid')
    expect(cookieArray[1].split('=')[0]).toBe('XSRF-TOKEN')
  },

  assertCookieStructure(cookies: unknown): void {
    expect(cookies).toBeInstanceOf(Array)
    expect(cookies).toHaveLength(2)
    expect(cookies).toSatisfy((c: unknown) => TestHelpers.validateCookies(c))
  },

  assertForbiddenError(response: supertest.Response): void {
    expect(response.status).toBe(401)
  },

  assertRegistrationSuccess(response: supertest.Response): void {
    expect(response.status).toBe(201)
    TestHelpers.assertUserResponse(response.body)
    TestHelpers.assertCookieStructure(response.headers['set-cookie'])
    TestHelpers.assertCookieNames(response.headers['set-cookie'])
  },

  assertUserResponse(body: unknown): void {
    expect(body).toHaveProperty('id')
    expect(body).toHaveProperty('username')
  },

  assertValidationError(response: supertest.Response): void {
    expect(response.status).toBe(400)
  },

  async createTestUser() {
    const testUser = {
      password: faker.internet.password({ length: 12 }),
      username: faker.internet.username(),
    }

    const res = await supertest(app)
      .post('/api/v1/users/register')
      .send(testUser)
      .expect(201)

    this.testUser = testUser
    return res
  },

  async deleteTestUser() {
    if (this.testUser?.username) {
      await db.delete(users).where(eq(users.username, this.testUser.username))
    }
  },

  extractCookies(setCookieHeader: unknown): string[] {
    if (Array.isArray(setCookieHeader)) {
      return setCookieHeader as string[]
    } else if (setCookieHeader) {
      return [setCookieHeader as string]
    }
    return []
  },

  extractCsrfToken(cookies: string[]): string {
    const csrfCookie = cookies.find((cookie) =>
      cookie.startsWith('XSRF-TOKEN=')
    )
    return csrfCookie?.split('=')[1]?.split(';')[0] ?? ''
  },

  testUser: null as null | TestUser,

  validateCookies(cookies: unknown): cookies is string[] {
    return (
      Array.isArray(cookies) &&
      cookies.every((cookie) => typeof cookie === 'string')
    )
  },
}

describe('Users Endpoints', () => {
  afterAll(async () => {
    await TestHelpers.deleteTestUser()
  })

  describe('POST /register', () => {
    test('should register a new user', async () => {
      const res = await TestHelpers.createTestUser()

      TestHelpers.assertRegistrationSuccess(res)
    })

    test('should return error with no payload', async () => {
      const res = await supertest(app).post('/api/v1/users/register')
      TestHelpers.assertValidationError(res)
    })

    test('should return error when username is missing', async () => {
      const res = await supertest(app)
        .post('/api/v1/users/register')
        .send({ password: faker.internet.password() })
      TestHelpers.assertValidationError(res)
    })

    test('should return error when password is missing', async () => {
      const res = await supertest(app)
        .post('/api/v1/users/register')
        .send({ username: faker.internet.username() })
      TestHelpers.assertValidationError(res)
    })

    test('should return error when password is less than 8 characters', async () => {
      const res = await supertest(app)
        .post('/api/v1/users/register')
        .send({
          password: faker.internet.password({ length: 7 }),
          username: faker.internet.username(),
        })
      TestHelpers.assertValidationError(res)
    })
  })

  describe('POST /login', () => {
    beforeAll(async () => {
      await TestHelpers.createTestUser()
    })

    test('should login an user', async () => {
      if (!TestHelpers.testUser) {
        throw new Error('Test user not created')
      }
      const res = await supertest(app)
        .post('/api/v1/users/login')
        .send(TestHelpers.testUser)

      TestHelpers.assertAuthSuccess(res)
    })

    test('should return error with no payload', async () => {
      const res = await supertest(app).post('/api/v1/users/login')
      TestHelpers.assertValidationError(res)
    })

    test('should return error when username is missing', async () => {
      if (!TestHelpers.testUser) {
        throw new Error('Test user not created')
      }
      const res = await supertest(app)
        .post('/api/v1/users/login')
        .send({ password: TestHelpers.testUser.password })
      TestHelpers.assertValidationError(res)
    })

    test('should return error when password is missing', async () => {
      if (!TestHelpers.testUser) {
        throw new Error('Test user not created')
      }
      const res = await supertest(app)
        .post('/api/v1/users/login')
        .send({ username: TestHelpers.testUser.username })
      TestHelpers.assertValidationError(res)
    })

    test('should return error when password is less than 8 characters', async () => {
      if (!TestHelpers.testUser) {
        throw new Error('Test user not created')
      }
      const res = await supertest(app)
        .post('/api/v1/users/login')
        .send({
          ...TestHelpers.testUser,
          password: TestHelpers.testUser.password.slice(0, 7),
        })
      TestHelpers.assertValidationError(res)
    })

    test('should return error with invalid credentials', async () => {
      const res = await supertest(app).post('/api/v1/users/login').send({
        // eslint-disable-next-line sonarjs/no-hardcoded-passwords
        password: 'wrongpassword123',
        username: 'nonexistentuser',
      })
      TestHelpers.assertAuthError(res)
    })

    test('should return error with wrong password', async () => {
      if (!TestHelpers.testUser) {
        throw new Error('Test user not created')
      }
      const res = await supertest(app).post('/api/v1/users/login').send({
        // eslint-disable-next-line sonarjs/no-hardcoded-passwords
        password: 'wrongpassword123',
        username: TestHelpers.testUser.username,
      })
      TestHelpers.assertAuthError(res)
    })
  })

  describe('GET /me', () => {
    let agent: supertest.Agent
    let csrfToken: string

    beforeAll(async () => {
      await TestHelpers.createTestUser()
      if (!TestHelpers.testUser) {
        throw new Error('Test user not created')
      }
      agent = supertest.agent(app)

      const res = await agent
        .post('/api/v1/users/login')
        .send(TestHelpers.testUser)
      TestHelpers.assertUserResponse(res.body)

      const cookies = TestHelpers.extractCookies(res.headers['set-cookie'])
      csrfToken = TestHelpers.extractCsrfToken(cookies)
    })

    test('should return user info when authenticated', async () => {
      if (!TestHelpers.testUser) {
        throw new Error('Test user not created')
      }
      const authRes = await agent
        .get('/api/v1/users/me')
        .set('x-xsrf-token', csrfToken)

      expect(authRes.status).toBe(200)
      expect(authRes.body).toHaveProperty('id')
      expect(authRes.body).toHaveProperty('username')
      expect((authRes.body as { username: string }).username).toBe(
        TestHelpers.testUser.username
      )
    })

    test('should return error when not authenticated', async () => {
      const res = await supertest(app).get('/api/v1/users/me')
      TestHelpers.assertForbiddenError(res)
    })
  })
})
