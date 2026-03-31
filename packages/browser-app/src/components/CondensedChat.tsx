import { useCallback } from 'react'
import {
  ChatShell,
  ChatMessage,
  MarkdownMessage,
  BadgeButton,
  getChatMessage,
} from '@ojfbot/frame-ui-components'
import '@ojfbot/frame-ui-components/styles/chat-shell'
import '@ojfbot/frame-ui-components/styles/markdown-message'
import '@ojfbot/frame-ui-components/styles/badge-button'
import type { BadgeAction, ChatDisplayState } from '@ojfbot/frame-ui-components'
import { useAppDispatch, useAppSelector } from '../store/store'
import {
  addMessage,
  setDraftInput,
  setIsLoading,
  setStreamingContent,
  setDisplayState,
} from '../store/chatSlice'
import type { CanvasSection } from '@lean-canvas/shared'

const API_BASE = import.meta.env.VITE_LEAN_CANVAS_API_URL ?? 'http://localhost:3026'

const SECTION_LABELS: Record<CanvasSection, string> = {
  PROBLEM: 'Problem', SOLUTION: 'Solution', VALUE_PROPOSITION: 'Value Proposition',
  KEY_METRICS: 'Key Metrics', CUSTOMER_SEGMENTS: 'Customer Segments', CHANNELS: 'Channels',
  COST_STRUCTURE: 'Cost Structure', REVENUE_STREAMS: 'Revenue Streams',
  UNFAIR_ADVANTAGE: 'Unfair Advantage',
}

interface Props {
  sidebarExpanded: boolean
}

export default function CondensedChat({ sidebarExpanded }: Props) {
  const dispatch = useAppDispatch()
  const messages = useAppSelector(s => s.chat.messages)
  const draftInput = useAppSelector(s => s.chat.draftInput)
  const isLoading = useAppSelector(s => s.chat.isLoading)
  const streamingContent = useAppSelector(s => s.chat.streamingContent)
  const displayState = useAppSelector(s => s.chat.displayState)
  const activeSection = useAppSelector(s => s.canvas.activeSection)
  const activeThreadId = useAppSelector(s => s.threads.activeThreadId)

  const contextSection: CanvasSection = activeSection ?? 'PROBLEM'
  const contextLabel = activeSection ? SECTION_LABELS[activeSection] : 'Canvas'

  const handleSend = useCallback(async (text: string) => {
    if (!text || isLoading) return

    dispatch(addMessage({ role: 'user', content: text }))
    dispatch(setDraftInput(''))
    dispatch(setIsLoading(true))
    dispatch(setStreamingContent(''))

    const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch(`${API_BASE}/api/canvas/${contextSection}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          threadId: `${activeThreadId}-global`,
          conversationHistory: history,
        }),
      })
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json() as { content: string }
      dispatch(addMessage({ role: 'assistant', content: data.content }))
    } catch (err) {
      dispatch(addMessage({
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Could not reach API.'}`,
      }))
    } finally {
      dispatch(setIsLoading(false))
    }
  }, [draftInput, isLoading, messages, contextSection, activeThreadId, dispatch])

  const handleExecute = useCallback((action: BadgeAction) => {
    const message = getChatMessage(action)
    if (message) handleSend(message)
  }, [handleSend])

  return (
    <ChatShell
      displayState={displayState as ChatDisplayState}
      onDisplayStateChange={(s) => dispatch(setDisplayState(s as ChatDisplayState))}
      sidebarExpanded={sidebarExpanded}
      title="AI Assistant"
      chatSummary={`Asking about: ${contextLabel}`}
      isLoading={isLoading}
      draftInput={draftInput}
      onDraftChange={(value) => dispatch(setDraftInput(value))}
      onSend={handleSend}
      placeholder={`Ask about ${contextLabel.toLowerCase()}...`}
      inputDisabled={isLoading}
      streamingContent={streamingContent ? (
        <ChatMessage role="assistant" isStreaming>
          <MarkdownMessage content={streamingContent} compact />
        </ChatMessage>
      ) : undefined}
    >
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} role={msg.role}>
          {msg.role === 'user' ? (
            <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
          ) : (
            <MarkdownMessage content={msg.content} onExecute={handleExecute} compact />
          )}
        </ChatMessage>
      ))}
    </ChatShell>
  )
}
