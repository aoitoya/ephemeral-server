import { Server } from 'socket.io'

import { userSocketMap } from '../../socket/socket.js'
import { NotificationRepository } from './notification.repository.js'

class NotificationService {
  private io: Server
  private notificationRepository: NotificationRepository

  constructor(io: Server) {
    this.io = io
    this.notificationRepository = new NotificationRepository()
  }

  async sendConnectionReqAccepted(
    targetUserId: string,
    actorUser: { id: string; username: string }
  ) {
    const roomId = userSocketMap.get(targetUserId)

    if (roomId) {
      this.io.to(roomId).emit('notify:connection:req-approved', actorUser)
      await this.notificationRepository.addApproveConnectionReq(
        targetUserId,
        actorUser.id
      )
    }
  }

  async sendConnectionReqReceived(
    targetUserId: string,
    actorUser: { id: string; username: string }
  ) {
    const roomId = userSocketMap.get(targetUserId)

    if (roomId) {
      this.io.to(roomId).emit('notify:connection:new-req', actorUser)
      await this.notificationRepository.addNewConnectionReq(
        targetUserId,
        actorUser.id
      )
    }
  }
}

export default NotificationService
