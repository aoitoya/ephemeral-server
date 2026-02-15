import { Request, Response } from 'express'

import env from '../../config/env.js'
import { type LoginUser, type NewUser } from '../../db/schema.js'
import { generateCsrfToken } from '../../utils/token.js'
import UserService from './user.service.js'

const isProduction = env.NODE_ENV === 'production'

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

    res.cookie('XSRF-TOKEN', generateCsrfToken(), {
      httpOnly: false,
      path: '/',
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
    })

    res.status(200).json(user)
  }

  logout = (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err)
      }
    })

    res.clearCookie('XSRF-TOKEN', { path: '/' })

    res.status(200).json({ message: 'Logged out successfully' })
  }

  register = async (req: Request<unknown, unknown, NewUser>, res: Response) => {
    const user = await this.userService.register(req.body)

    req.session.user = { id: user.id, username: user.username }

    res.cookie('XSRF-TOKEN', generateCsrfToken(), {
      httpOnly: false,
      path: '/',
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
    })

    res.status(201).json(user)
  }
}

export default UserController
