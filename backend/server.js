require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const helmet = require('helmet')
const routes = require('./routes')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()

app.use(helmet())
const FRONTEND_ORIGIN = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')
app.use(cors({ origin: FRONTEND_ORIGIN, methods:['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders:['Content-Type','Authorization'], credentials:true }))
app.use(express.json({ limit:'10mb' }))
app.use(express.urlencoded({ extended:true }))

const httpServer = http.createServer(app)
const io = new Server(httpServer, {
  cors: { origin: FRONTEND_ORIGIN, methods:['GET','POST'] },
  transports: ['websocket'],
  pingInterval: 25000,
  pingTimeout: 60000,
})

app.use((req, res, next) => { req.io = io; next() })

app.get('/', (req, res) => res.json({ name:'InterviewFlow API', status:'ok', version:'1.0.0' }))
app.get('/api/health', (req, res) => res.json({ status:'ok', timestamp:new Date().toISOString() }))
app.use('/api', routes)
app.use((req, res) => res.status(404).json({ error:`Route ${req.method} ${req.path} not found` }))
app.use(errorHandler)

io.on('connection', (socket) => {
  socket.on('join-session', (sessionId) => { if (sessionId) socket.join(sessionId) })
  socket.on('leave-session', (sessionId) => { socket.leave(sessionId) })
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))

process.on('uncaughtException', (err) => { console.error('Uncaught:', err); process.exit(1) })
process.on('unhandledRejection', (err) => { console.error('Unhandled:', err); process.exit(1) })
