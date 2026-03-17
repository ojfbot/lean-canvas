import type { CanvasSection, Message } from '@lean-canvas/shared'

export interface CanvasAgentState {
  section: CanvasSection
  userMessage: string
  conversationHistory: Message[]
  response: string
  threadId: string
  error?: string
}
