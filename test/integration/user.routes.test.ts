import { faker } from '@faker-js/faker'
import supertest from 'supertest'
import { beforeAll, describe, expect, test } from 'vitest'

import app from '../../src/app.js'

interface TestUser {
  password: string
  username: string
}

interface UserResponse {
  expiresAt: string
  id: string
  token: string
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
    expect(cookieArray[1].split('=')[0]).toBe('refreshToken')
    expect(cookieArray[2].split('=')[0]).toBe('XSRF-TOKEN')
  },

  assertCookieStructure(cookies: unknown): void {
    expect(cookies).toBeInstanceOf(Array)
    expect(cookies).toHaveLength(3)
    expect(cookies).toSatisfy((c: unknown) => TestHelpers.validateCookies(c))
  },

  assertForbiddenError(response: supertest.Response): void {
    expect(response.status).toBe(403)
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
    expect(body).toHaveProperty('token')
    expect(body).toHaveProperty('expiresAt')
  },

  assertValidationError(response: supertest.Response): void {
    expect(response.status).toBe(400)
  },

  createTestUser(): TestUser {
    return {
      password: faker.internet.password({ length: 12 }),
      username: faker.internet.username(),
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

  validateCookies(cookies: unknown): cookies is string[] {
    return (
      Array.isArray(cookies) &&
      cookies.every((cookie) => typeof cookie === 'string')
    )
  },
}

describe('Users Endpoints', () => {
  const testUser = TestHelpers.createTestUser()

  describe('POST /register', () => {
    test('should register a new user', async () => {
      const res = await supertest(app)
        .post('/api/v1/users/register')
        .send(testUser)

      TestHelpers.assertRegistrationSuccess(res)
    })

    test('should return error with no payload', async () => {
      const res = await supertest(app).post('/api/v1/users/register')
      TestHelpers.assertValidationError(res)
    })

    test('should return error when username is missing', async () => {
      const res = await supertest(app)
        .post('/api/v1/users/register')
        .send({ password: testUser.password })
      TestHelpers.assertValidationError(res)
    })

    test('should return error when password is missing', async () => {
      const res = await supertest(app)
        .post('/api/v1/users/register')
        .send({ username: testUser.username })
      TestHelpers.assertValidationError(res)
    })

    test('should return error when password is less than 8 characters', async () => {
      const res = await supertest(app)
        .post('/api/v1/users/register')
        .send({
          ...testUser,
          password: testUser.password.slice(0, 7),
        })
      TestHelpers.assertValidationError(res)
    })
  })

  describe('POST /login', () => {
    test('should login an user', async () => {
      const res = await supertest(app)
        .post('/api/v1/users/login')
        .send(testUser)

      TestHelpers.assertAuthSuccess(res)
    })

    test('should return error with no payload', async () => {
      const res = await supertest(app).post('/api/v1/users/login')
      TestHelpers.assertValidationError(res)
    })

    test('should return error when username is missing', async () => {
      const res = await supertest(app)
        .post('/api/v1/users/login')
        .send({ password: testUser.password })
      TestHelpers.assertValidationError(res)
    })

    test('should return error when password is missing', async () => {
      const res = await supertest(app)
        .post('/api/v1/users/login')
        .send({ username: testUser.username })
      TestHelpers.assertValidationError(res)
    })

    test('should return error when password is less than 8 characters', async () => {
      const res = await supertest(app)
        .post('/api/v1/users/login')
        .send({
          ...testUser,
          password: testUser.password.slice(0, 7),
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
      const res = await supertest(app).post('/api/v1/users/login').send({
        // eslint-disable-next-line sonarjs/no-hardcoded-passwords
        password: 'wrongpassword123',
        username: testUser.username,
      })
      TestHelpers.assertAuthError(res)
    })
  })

  describe('POST /refresh-token', () => {
    let cookies: string[]

    beforeAll(async () => {
      const res = await supertest(app)
        .post('/api/v1/users/login')
        .send(testUser)
      cookies = TestHelpers.extractCookies(res.headers['set-cookie'])
    })

    test('should refresh token with valid refresh token', async () => {
      const res = await supertest(app)
        .post('/api/v1/users/refresh-token')
        .set('Cookie', cookies)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('token')
      expect(res.body).toHaveProperty('expiresIn')
      expect(res.headers['set-cookie']).toBeDefined()
    })

    test('should return error when refresh token is missing', async () => {
      const res = await supertest(app).post('/api/v1/users/refresh-token')
      TestHelpers.assertAuthError(res)
    })

    test('should return error with invalid refresh token', async () => {
      const res = await supertest(app)
        .post('/api/v1/users/refresh-token')
        .set('Cookie', 'refreshToken=invalidtoken')

      expect([401, 429]).toContain(res.status)
    })
  })

  describe('GET /me', () => {
    let agent: supertest.Agent
    let authToken: string
    let csrfToken: string

    beforeAll(async () => {
      agent = supertest.agent(app)

      const res = await agent.post('/api/v1/users/login').send(testUser)
      TestHelpers.assertUserResponse(res.body)

      const userBody = res.body as UserResponse
      authToken = userBody.token

      const cookies = TestHelpers.extractCookies(res.headers['set-cookie'])
      csrfToken = TestHelpers.extractCsrfToken(cookies)
    })

    test('should return user info when authenticated', async () => {
      const authRes = await agent
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-xsrf-token', csrfToken)

      expect(authRes.status).toBe(200)
      expect(authRes.body).toHaveProperty('id')
      expect(authRes.body).toHaveProperty('username')
      expect((authRes.body as { username: string }).username).toBe(
        testUser.username
      )
    })

    test('should return error when not authenticated', async () => {
      const res = await supertest(app).get('/api/v1/users/me')
      TestHelpers.assertForbiddenError(res)
    })
  })
})
