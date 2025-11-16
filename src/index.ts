import { createServer } from 'node:http'

import app from './app.js'
import env from './config/env.js'
import logger from './config/logger.js'
import messageService from './services/messages.service.js'

const PORT = env.PORT

const server = createServer(app)

messageService.init(server)

server.listen(PORT, () => {
  logger.info('Server is running on port', PORT)
})
