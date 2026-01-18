import { faker } from '@faker-js/faker'
import { beforeAll, describe, expect, test } from 'vitest'

import UserService from '../../src/modules/users/user.service.js'

const testUserInput = {
  password: faker.internet.password(),
  username: faker.internet.username(),
}

describe('user service', () => {
  let userService: UserService

  beforeAll(() => {
    userService = new UserService()
  })

  test('should register a new user', async () => {
    const user = await userService.register(testUserInput)
    expect(user).toBeDefined()
    expect(user.username).toBe(testUserInput.username)
    expect(user.id).toBeDefined()
    expect(user).not.toHaveProperty('password')
  })

  test('should login with valid credentials', async () => {
    const user = await userService.login(testUserInput)
    expect(user).toBeDefined()
    expect(user.username).toBe(testUserInput.username)
    expect(user.id).toBeDefined()
    expect(user).not.toHaveProperty('password')
  })

  test('should throw error when login with nonexistent user', async () => {
    await expect(
      userService.login({
        // eslint-disable-next-line sonarjs/no-hardcoded-passwords
        password: 'wrongpassword123',
        username: 'nonexistentuser',
      })
    ).rejects.toThrow('User not found')
  })

  test('should throw error when login with wrong password', async () => {
    await expect(
      userService.login({
        // eslint-disable-next-line sonarjs/no-hardcoded-passwords
        password: 'wrongpassword123',
        username: testUserInput.username,
      })
    ).rejects.toThrow('Invalid password')
  })

  test('should throw error when registering duplicate user', async () => {
    await expect(userService.register(testUserInput)).rejects.toThrow()
  })
})
