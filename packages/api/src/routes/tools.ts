import { Router } from 'express'
import type { ToolManifestEntry } from '@lean-canvas/shared'

export const toolsRouter = Router()

// GET /api/tools — ADR-0007 capability manifest
// Unauthenticated. Required for MetaOrchestratorAgent discovery.
toolsRouter.get('/', (_req, res) => {
  const tools: ToolManifestEntry[] = [
    {
      name: 'canvas_section_chat',
      description: 'AI-assisted analysis and ideation for a specific Lean Canvas section',
      endpoint: '/api/canvas/:section/chat',
    },
    {
      name: 'get_canvas_state',
      description: 'Retrieve current canvas thread state for all sections',
      endpoint: '/api/canvas/state',
    },
    {
      name: 'get_section_threads',
      description: 'Retrieve chat threads for a specific canvas section',
      endpoint: '/api/canvas/:section/threads',
    },
  ]

  res.json({
    service: 'lean-canvas',
    version: '0.0.1',
    description: 'AI-assisted Lean Canvas for business model value proposition design',
    tools,
  })
})
