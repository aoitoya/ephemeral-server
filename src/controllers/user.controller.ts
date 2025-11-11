import { Request, Response } from 'express'

import env from '../config/env.js'
import { type LoginUser, type NewUser } from '../db/schema.js'
import tokenRepository from '../repositories/token.repository.js'
import UserService from '../services/user.service.js'
import {
  generateAccessToken,
  generateCsrfToken,
  generateRefreshToken,
} from '../utils/token.js'

class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  login = async (req: Request<unknown, unknown, LoginUser>, res: Response) => {
    const user = await this.userService.login(req.body)

    const accessToken = generateAccessToken({
      id: user.id,
    })
    const refreshToken = generateRefreshToken()
    const expiresAt = new Date(Date.now() + env.REFRESH_EXPIRES_IN)

    await tokenRepository.save(
      user.id,
      refreshToken,
      expiresAt,
      req.get('user-agent')
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: env.REFRESH_EXPIRES_IN,
      sameSite: 'strict',
      secure: env.NODE_ENV === 'production',
    })

    res.cookie('XSRF-TOKEN', generateCsrfToken(), {
      httpOnly: false,
      maxAge: env.REFRESH_EXPIRES_IN,
      sameSite: 'strict',
      secure: env.NODE_ENV === 'production',
    })

    res.status(200).json({
      ...user,
      expiresAt: Date.now() + env.JWT_ACCESS_EXPIRES_IN,
      token: accessToken,
    })
  }

  refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken as string

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' })
    }

    const oldRefreshToken = await tokenRepository.getValidToken(refreshToken)

    if (!oldRefreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

    const newRefreshToken = generateRefreshToken()
    const expiresAt = new Date(Date.now() + env.REFRESH_EXPIRES_IN)

    await tokenRepository.rotateToken(refreshToken, newRefreshToken, expiresAt)

    const accessToken = generateAccessToken({ id: oldRefreshToken.userId })

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: env.REFRESH_EXPIRES_IN,
      path: '/refresh-token',
      sameSite: 'strict',
      secure: env.NODE_ENV === 'production',
    })

    res.cookie('XSRF-TOKEN', generateCsrfToken(), {
      httpOnly: false,
      maxAge: env.REFRESH_EXPIRES_IN,
      path: '/',
      sameSite: 'strict',
      secure: env.NODE_ENV === 'production',
    })

    res.json({
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      token: accessToken,
    })
  }

  register = async (req: Request<unknown, unknown, NewUser>, res: Response) => {
    const user = await this.userService.register(req.body)
    res.status(201).json(user)
  }
}

export default UserController
