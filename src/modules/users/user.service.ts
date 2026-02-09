import bcrypt from 'bcryptjs'

import env from '../../config/env.js'
import { type LoginUser, type NewUser, type User } from '../../db/schema.js'
import { AuthenticationError } from '../../shared/errors/index.js'
import UserRepository from './user.repository.js'

class UserService {
  private userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  async getUserById(userId: string): Promise<Pick<User, 'id' | 'username'>> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new AuthenticationError('User not found', 'USER_NOT_FOUND')
    }
    const { password: _, ...userInfo } = user
    return userInfo
  }

  async login(data: LoginUser): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findByUsername(data.username)
    if (!user) {
      throw new AuthenticationError('User not found', 'USER_NOT_FOUND')
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.password)
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid password', 'INVALID_PASSWORD')
    }
    const { password: _, ...userInfo } = user

    return userInfo
  }

  async register(data: NewUser): Promise<Pick<User, 'id' | 'username'>> {
    const hashedPassword = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS)
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    })

    const { ...userInfo } = user

    return userInfo
  }
}

export default UserService
