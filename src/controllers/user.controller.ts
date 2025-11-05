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
    const user = await this.userService.login(req.body)

    const token = jwt.sign({ id: user.id }, env.JWT_SECRET, {
      expiresIn: '1h',
    })
    res.status(200).json({ ...user, token })
  }

  register = async (req: Request<unknown, unknown, NewUser>, res: Response) => {
    const user = await this.userService.register(req.body)
    res.status(201).json(user)
  }
}

export default UserController
