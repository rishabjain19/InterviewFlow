import { useEffect, useCallback } from 'react'
import socket from '../utils/socket'

export function useSocket(sessionId, onQueueUpdate) {
  const joinRoom = useCallback(() => {
    if (sessionId && socket.connected) socket.emit('join-session', sessionId)
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) return
    if (!socket.connected) socket.connect()
    joinRoom()
    socket.on('connect', joinRoom)
    socket.on('queue-updated', onQueueUpdate)
    return () => {
      socket.emit('leave-session', sessionId)
      socket.off('connect', joinRoom)
      socket.off('queue-updated', onQueueUpdate)
    }
  }, [sessionId, joinRoom, onQueueUpdate])
}
