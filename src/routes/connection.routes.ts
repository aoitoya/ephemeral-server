import { Router } from 'express'

import ConnectionController from '../controllers/connection.controller.js'
import { validateRequestBody } from '../middleware/validate.middleware.js'
import {
  actionConnectionSchema,
  requestConnectionSchema,
} from '../validations/connection.validation.js'

const connectionRouter = Router()
const connectionController = new ConnectionController()

connectionRouter.get('/', connectionController.getConnections)

connectionRouter.get(
  '/online-connections',
  connectionController.getOnlineConnections
)

connectionRouter.post(
  '/request',
  validateRequestBody(requestConnectionSchema),
  connectionController.requestConnection
)

connectionRouter.post(
  '/response',
  validateRequestBody(actionConnectionSchema),
  connectionController.actionConnection
)

connectionRouter.delete('/:connectionId', connectionController.removeConnection)

export default connectionRouter
