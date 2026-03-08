import React, { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useCurrentUser } from './useAuth'
import { SocketContext } from './socket-context'

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const { data: user } = useCurrentUser()

  useEffect(() => {
    if (user) {
      const newSocket = io('/', {
        withCredentials: true,
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
        setSocket(null)
        setIsConnected(false)
        setConnectionError(null)
      }
    }
  }, [user])

  useEffect(() => {
    if (!socket) return

    const handleConnect = () => {
      setIsConnected(true)
      setConnectionError(null)
    }

    const handleConnectionError = (error: Error) => {
      console.error('[socket error]', error)
      setConnectionError(error.message)
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    socket.on('connect', handleConnect)
    socket.on('connect_error', handleConnectionError)
    socket.on('disconnect', handleDisconnect)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('connect_error', handleConnectionError)
      socket.off('disconnect', handleDisconnect)
    }
  }, [socket])

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectionError }}>
      {children}
    </SocketContext.Provider>
  )
}
