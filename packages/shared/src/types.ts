// Lean Canvas section types — 9 sections matching the Lean Canvas framework
export type CanvasSection =
  | 'PROBLEM'
  | 'SOLUTION'
  | 'VALUE_PROPOSITION'
  | 'KEY_METRICS'
  | 'CUSTOMER_SEGMENTS'
  | 'CHANNELS'
  | 'COST_STRUCTURE'
  | 'REVENUE_STREAMS'
  | 'UNFAIR_ADVANTAGE'

export const CANVAS_SECTIONS: CanvasSection[] = [
  'PROBLEM',
  'SOLUTION',
  'VALUE_PROPOSITION',
  'KEY_METRICS',
  'CUSTOMER_SEGMENTS',
  'CHANNELS',
  'COST_STRUCTURE',
  'REVENUE_STREAMS',
  'UNFAIR_ADVANTAGE',
]

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export interface CanvasThread {
  id: string
  sectionId: CanvasSection
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export interface CanvasState {
  activeSection: CanvasSection | null
  threads: Record<string, CanvasThread[]>
}

export interface ChatRequest {
  section: CanvasSection
  message: string
  threadId?: string
  conversationHistory?: Message[]
}

export interface ChatResponse {
  content: string
  threadId: string
  section: CanvasSection
}

export interface ToolManifestEntry {
  name: string
  description: string
  endpoint: string
}
