import bcrypt from 'bcryptjs'

import env from '../../config/env.js'
import { type LoginUser, type NewUser, type User } from '../../db/schema.js'
import UserRepository from './user.repository.js'

class UserService {
  private userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  async getAll(): Promise<Omit<User, 'createdAt' | 'password'>[]> {
    const users = await this.userRepository.getAll()
    return users
  }

  async login(data: LoginUser): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findByUsername(data.username)
    if (!user) {
      throw new Error('User not found')
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid password')
    }
    const { password: _, ...userInfo } = user

    return userInfo
  }

  async register(data: NewUser): Promise<Omit<User, 'password'>> {
    const hashedPassword = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS)
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    })

    const { password: _, ...userInfo } = user

    return userInfo
  }
}

export default UserService
