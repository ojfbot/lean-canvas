import express from 'express'
import cors from 'cors'
import { canvasRouter } from './routes/canvas.js'
import { toolsRouter } from './routes/tools.js'
import { getLogger } from './utils/logger.js'

const log = getLogger('server')
const app = express()
const PORT = parseInt(process.env.PORT ?? '3026', 10)

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3025' }))
app.use(express.json())

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'lean-canvas' }))

// Capability manifest (ADR-0007) — unauthenticated
app.use('/api/tools', toolsRouter)

// Canvas section chat routes
app.use('/api/canvas', canvasRouter)

app.listen(PORT, () => {
  log.info(`lean-canvas API listening on :${PORT}`)
})
