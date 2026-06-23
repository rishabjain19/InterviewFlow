import { io } from 'socket.io-client'

const URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : (import.meta.env.PROD ? 'https://interviewflow-1-anoe.onrender.com' : 'http://localhost:5000')

const socket = io(URL, {
  transports: ['websocket'],
  autoConnect: false,
})

export default socket
