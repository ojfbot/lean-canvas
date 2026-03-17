import { Router } from 'express'
import { z } from 'zod'
import { canvasSectionNode } from '@lean-canvas/agent-graph'
import { CANVAS_SECTIONS, type CanvasSection } from '@lean-canvas/shared'
import { getLogger } from '../utils/logger.js'

const log = getLogger('canvas')
export const canvasRouter = Router()

const ChatBodySchema = z.object({
  message: z.string().min(1).max(4000),
  threadId: z.string().optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().default([]),
})

// POST /api/canvas/:section/chat
canvasRouter.post('/:section/chat', async (req, res) => {
  const section = req.params.section.toUpperCase() as CanvasSection

  if (!CANVAS_SECTIONS.includes(section)) {
    res.status(400).json({ error: `Unknown section: ${section}. Valid: ${CANVAS_SECTIONS.join(', ')}` })
    return
  }

  const parsed = ChatBodySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { message, threadId, conversationHistory } = parsed.data
  const resolvedThreadId = threadId ?? `${section}-${Date.now()}`

  try {
    const result = await canvasSectionNode({
      section,
      userMessage: message,
      conversationHistory,
      response: '',
      threadId: resolvedThreadId,
    })

    res.json({
      content: result.response ?? '',
      threadId: resolvedThreadId,
      section,
      error: result.error,
    })
  } catch (err) {
    log.error('canvas chat error', { section, err })
    res.status(500).json({ error: 'Internal error' })
  }
})

// GET /api/canvas/state — placeholder (full persistence in next phase)
canvasRouter.get('/state', (_req, res) => {
  res.json({ activeSection: null, threads: {} })
})

// GET /api/canvas/:section/threads — placeholder
canvasRouter.get('/:section/threads', (req, res) => {
  const section = req.params.section.toUpperCase()
  res.json({ section, threads: [] })
})
