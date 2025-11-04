import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import env from '../config/env.js'
import { type LoginUser, type NewUser } from '../db/schema.js'
import UserService from '../services/user.service.js'

class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  login = async (req: Request<unknown, unknown, LoginUser>, res: Response) => {
    try {
      const user = await this.userService.login(req.body)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const token = jwt.sign({ id: user.id }, env.JWT_SECRET, {
        expiresIn: '1h',
      }) as string
      res.status(200).json({ ...user, token })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Failed to login user' })
    }
  }

  register = async (req: Request<unknown, unknown, NewUser>, res: Response) => {
    try {
      const user = await this.userService.register(req.body)
      res.status(201).json(user)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Failed to register user' })
    }
  }
}

export default UserController
