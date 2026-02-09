import { Request, Response } from 'express'

import env from '../../config/env.js'
import { type LoginUser, type NewUser } from '../../db/schema.js'
import tokenRepository from '../../repositories/token.repository.js'
import { AuthenticationError } from '../../shared/errors/index.js'
import {
  generateAccessToken,
  generateCsrfToken,
  generateRefreshToken,
} from '../../utils/token.js'
import UserService from './user.service.js'

class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  getMe = (req: Request, res: Response) => {
    res.json(req.session.user)
  }

  login = async (req: Request<unknown, unknown, LoginUser>, res: Response) => {
    const user = await this.userService.login(req.body)

    req.session.user = { id: user.id, username: user.username }

    const accessToken = generateAccessToken({
      id: user.id,
    })
    const refreshToken = generateRefreshToken()
    const expiresAt = new Date(Date.now() + env.REFRESH_EXPIRES_IN * 1000)

    await tokenRepository.save(
      user.id,
      refreshToken,
      expiresAt,
      req.get('user-agent')
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: env.REFRESH_EXPIRES_IN * 1000,
      path: '/',
      sameSite: 'strict',
      secure: env.NODE_ENV === 'production',
    })

    res.cookie('XSRF-TOKEN', generateCsrfToken(), {
      httpOnly: false,
      maxAge: env.REFRESH_EXPIRES_IN * 1000,
      path: '/',
      sameSite: 'strict',
      secure: env.NODE_ENV === 'production',
    })

    res.status(200).json({
      ...user,
      expiresAt: Date.now() + env.JWT_ACCESS_EXPIRES_IN * 1000,
      token: accessToken,
    })
  }

  logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken as string

    if (refreshToken) {
      await tokenRepository.revokeToken(refreshToken)
    }

    req.session.destroy(() => {
      // Session destruction is async, we don't need to wait for it
    })

    res.clearCookie('refreshToken', { path: '/' })
    res.clearCookie('XSRF-TOKEN', { path: '/' })

    res.status(200).json({ message: 'Logged out successfully' })
  }

  refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken as string

    if (!refreshToken) {
      throw new AuthenticationError('No refresh token provided')
    }

    const oldRefreshToken = await tokenRepository.getValidToken(refreshToken)

    if (!oldRefreshToken) {
      throw new AuthenticationError(
        'Invalid refresh token',
        'INVALID_REFRESH_TOKEN'
      )
    }

    const user = await this.userService.getUserById(oldRefreshToken.userId)

    req.session.user = { id: user.id, username: user.username }

    const newRefreshToken = generateRefreshToken()
    const expiresAt = new Date(Date.now() + env.REFRESH_EXPIRES_IN * 1000)

    await tokenRepository.rotateToken(refreshToken, newRefreshToken, expiresAt)

    const accessToken = generateAccessToken({ id: oldRefreshToken.userId })

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: env.REFRESH_EXPIRES_IN * 1000,
      path: '/',
      sameSite: 'strict',
      secure: env.NODE_ENV === 'production',
    })

    res.cookie('XSRF-TOKEN', generateCsrfToken(), {
      httpOnly: false,
      maxAge: env.REFRESH_EXPIRES_IN * 1000,
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

    req.session.user = { id: user.id, username: user.username }

    const accessToken = generateAccessToken({
      id: user.id,
    })
    const refreshToken = generateRefreshToken()
    const expiresAt = new Date(Date.now() + env.REFRESH_EXPIRES_IN * 1000)

    await tokenRepository.save(
      user.id,
      refreshToken,
      expiresAt,
      req.get('user-agent')
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: env.REFRESH_EXPIRES_IN * 1000,
      path: '/',
      sameSite: 'strict',
      secure: env.NODE_ENV === 'production',
    })

    res.cookie('XSRF-TOKEN', generateCsrfToken(), {
      httpOnly: false,
      maxAge: env.REFRESH_EXPIRES_IN * 1000,
      path: '/',
      sameSite: 'strict',
      secure: env.NODE_ENV === 'production',
    })

    res.status(201).json({
      ...user,
      expiresAt: Date.now() + env.JWT_ACCESS_EXPIRES_IN * 1000,
      token: accessToken,
    })
  }
}

export default UserController
