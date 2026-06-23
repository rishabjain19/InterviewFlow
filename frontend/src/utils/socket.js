import { io } from 'socket.io-client'

const URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000'

const socket = io(URL, {
  transports: ['websocket'],
  autoConnect: false,
})

export default socket
