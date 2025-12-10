import { createServer } from 'node:http'

import app from './app.js'
import env from './config/env.js'
import logger from './config/logger.js'
import MessageService from './socket/message.socket.js'
import * as socket from './socket/socket.js'

const PORT = env.PORT

const server = createServer(app)

const io = socket.init(server)
const messageService = new MessageService(io)
messageService.init()

server.listen(PORT, () => {
  logger.info('Server is running on port', PORT)
})
