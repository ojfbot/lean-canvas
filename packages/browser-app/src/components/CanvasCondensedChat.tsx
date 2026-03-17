import { useRef, useEffect, useCallback } from 'react'
import { TextInput, TextArea, Button, IconButton, InlineLoading, Tile } from '@carbon/react'
import { SendAlt, Minimize, ChatBot } from '@carbon/icons-react'
import { useAppDispatch, useAppSelector } from '../store/store'
import {
  addMessage,
  setDraftInput,
  setIsLoading,
  setStreamingContent,
  setDisplayState,
} from '../store/chatSlice'
import type { CanvasSection } from '@lean-canvas/shared'
import './CanvasCondensedChat.css'

const API_BASE = import.meta.env.VITE_LEAN_CANVAS_API_URL ?? 'http://localhost:3026'

const SECTION_LABELS: Record<CanvasSection, string> = {
  PROBLEM: 'Problem',
  SOLUTION: 'Solution',
  VALUE_PROPOSITION: 'Value Proposition',
  KEY_METRICS: 'Key Metrics',
  CUSTOMER_SEGMENTS: 'Customer Segments',
  CHANNELS: 'Channels',
  COST_STRUCTURE: 'Cost Structure',
  REVENUE_STREAMS: 'Revenue Streams',
  UNFAIR_ADVANTAGE: 'Unfair Advantage',
}

// ADR-0020: NO Redux imports in this file — all state wiring done via hooks from store.
export default function CanvasCondensedChat() {
  const dispatch = useAppDispatch()
  const messages = useAppSelector(s => s.chat.messages)
  const draftInput = useAppSelector(s => s.chat.draftInput)
  const isLoading = useAppSelector(s => s.chat.isLoading)
  const streamingContent = useAppSelector(s => s.chat.streamingContent)
  const displayState = useAppSelector(s => s.chat.displayState)
  const activeSection = useAppSelector(s => s.canvas.activeSection)
  const activeThreadId = useAppSelector(s => s.threads.activeThreadId)

  const isExpanded = displayState === 'expanded'
  const contextSection: CanvasSection = activeSection ?? 'PROBLEM'

  const inputRef = useRef<HTMLInputElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => textAreaRef.current?.focus(), 100)
    }
  }, [isExpanded])

  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, streamingContent, isExpanded])

  const handleSend = useCallback(async (text?: string) => {
    const userText = (text ?? draftInput).trim()
    if (!userText || isLoading) return

    dispatch(addMessage({ role: 'user', content: userText }))
    dispatch(setDraftInput(''))
    dispatch(setIsLoading(true))
    dispatch(setStreamingContent(''))

    // Build conversation history from Redux messages (last 10 turns max)
    const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch(`${API_BASE}/api/canvas/${contextSection}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const contextLabel = activeSection
    ? `Canvas AI — ${SECTION_LABELS[activeSection]}`
    : 'Canvas AI Assistant'

  return (
    <div
      className={`canvas-condensed-chat${isExpanded ? ' expanded' : ''}`}
      data-element="canvas-chat-window"
    >
      {/* Header / collapsed bar */}
      <div
        className="canvas-condensed-header"
        onClick={() => !isExpanded && dispatch(setDisplayState('expanded'))}
        style={{ cursor: isExpanded ? 'default' : 'pointer' }}
      >
        <div className="canvas-header-left">
          <ChatBot size={20} />
          <span className="canvas-header-title">{contextLabel}</span>
          {!isExpanded && isLoading && (
            <InlineLoading status="active" style={{ marginLeft: '0.5rem' }} />
          )}
        </div>
        <div className="canvas-header-actions">
          {isExpanded && (
            <IconButton
              label="Minimize chat"
              onClick={e => { e.stopPropagation(); dispatch(setDisplayState('collapsed')) }}
              size="sm"
              kind="ghost"
            >
              <Minimize size={16} />
            </IconButton>
          )}
        </div>
      </div>

      {/* Message history (expanded only) */}
      {isExpanded && (
        <div className="canvas-chat-messages" data-element="canvas-chat-messages">
          {messages.length === 0 && (
            <div className="canvas-chat-empty">
              Ask about the active section or your canvas as a whole.
            </div>
          )}
          {messages.map((msg, idx) => (
            <Tile key={idx} className={`canvas-message-tile ${msg.role}`}>
              <div className="canvas-message-header">
                <strong>{msg.role === 'user' ? 'You' : 'Canvas AI'}</strong>
              </div>
              <div className="canvas-message-content">
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>
                  {msg.content}
                </pre>
              </div>
            </Tile>
          ))}
          {streamingContent && (
            <Tile className="canvas-message-tile assistant streaming">
              <div className="canvas-message-header">
                <strong>Canvas AI</strong>
                <span className="canvas-streaming-indicator">Typing…</span>
              </div>
              <div className="canvas-message-content">
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>
                  {streamingContent}
                </pre>
              </div>
            </Tile>
          )}
          {isLoading && !streamingContent && (
            <Tile className="canvas-message-tile assistant">
              <InlineLoading description="Thinking…" />
            </Tile>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input row */}
      <div className="canvas-condensed-input-wrapper">
        <div className="canvas-textarea-container">
          {isExpanded ? (
            <TextArea
              ref={textAreaRef}
              labelText="Message"
              placeholder="Ask about this canvas section…"
              value={draftInput}
              onChange={e => dispatch(setDraftInput(e.target.value))}
              onKeyDown={handleKeyDown}
              rows={2}
              className="canvas-chat-textarea"
              data-element="canvas-chat-input"
            />
          ) : (
            <TextInput
              ref={inputRef}
              id="canvas-condensed-input"
              labelText=""
              placeholder="Ask Canvas AI…"
              value={draftInput}
              onChange={e => dispatch(setDraftInput(e.target.value))}
              onKeyDown={e => {
                if (e.key === 'Enter' && !isLoading) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              onFocus={() => !isExpanded && dispatch(setDisplayState('expanded'))}
              size="md"
              data-element="canvas-chat-input"
            />
          )}
        </div>
        <div className="canvas-input-actions">
          <Button
            renderIcon={SendAlt}
            onClick={() => handleSend()}
            disabled={!draftInput.trim() || isLoading}
            size="sm"
            kind="primary"
            hasIconOnly
            iconDescription="Send"
            className="canvas-send-button"
            data-element="canvas-chat-send"
          />
        </div>
      </div>
    </div>
  )
}
