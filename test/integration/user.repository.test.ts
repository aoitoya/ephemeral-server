import { faker } from '@faker-js/faker'
import { beforeAll, describe, expect, test } from 'vitest'

import UserRepository from '../../src/modules/users/user.repository.js'

const testUserInput = {
  password: faker.internet.password(),
  username: faker.internet.username(),
}

describe('user repository', () => {
  let userRepository: UserRepository
  let createdUserId: string

  beforeAll(() => {
    userRepository = new UserRepository()
  })

  test('should create a user', async () => {
    const user = await userRepository.create(testUserInput)
    expect(user).toBeDefined()
    expect(user.username).toBe(testUserInput.username)
    expect(user.id).toBeDefined()
    expect(user).not.toHaveProperty('password')
    createdUserId = user.id
  })

  test('should find user by username', async () => {
    const user = await userRepository.findByUsername(testUserInput.username)
    if (!user) {
      throw new Error('User should exist')
    }
    expect(user.username).toBe(testUserInput.username)
    expect(user.password).toBeDefined()
    expect(user.id).toBe(createdUserId)
  })

  test('should return null when user not found by username', async () => {
    const user = await userRepository.findByUsername('nonexistentuser')
    expect(user).toBeNull()
  })

  test('should get all users', async () => {
    const users = await userRepository.getAll()
    expect(users).toBeInstanceOf(Array)
    expect(users.length).toBeGreaterThan(0)

    const createdUser = users.find((u) => u.id === createdUserId)
    if (!createdUser) {
      throw new Error('Created user should be in the list')
    }
    expect(createdUser.username).toBe(testUserInput.username)
    expect(createdUser).not.toHaveProperty('password')
    expect(createdUser).not.toHaveProperty('createdAt')
  })

  test('should set user status to online', async () => {
    await userRepository.setStatus(createdUserId, true)

    const user = await userRepository.findByUsername(testUserInput.username)
    if (!user) {
      throw new Error('User should exist')
    }
    expect(user.isOnline).toBe(true)
  })

  test('should set user status to offline with lastOnline timestamp', async () => {
    await userRepository.setStatus(createdUserId, false)

    const user = await userRepository.findByUsername(testUserInput.username)
    if (!user) {
      throw new Error('User should exist')
    }
    expect(user.isOnline).toBe(false)
    expect(user.lastOnline).toBeInstanceOf(Date)
  })
})
