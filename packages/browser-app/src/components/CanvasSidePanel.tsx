import { useState, useRef, useEffect, useCallback } from 'react'
import { TextArea, Button, IconButton, InlineLoading, Tile } from '@carbon/react'
import { SendAlt, Add, TrashCan, ChatBot, List } from '@carbon/icons-react'
import { useAppDispatch, useAppSelector } from '../store/store'
import { addThread, switchThread, removeThread, renameThread } from '../store/threadsSlice'
import {
  addMessage,
  setDraftInput,
  setIsLoading,
  setStreamingContent,
} from '../store/chatSlice'
import type { CanvasSection } from '@lean-canvas/shared'
import type { PanelTab } from '../store/threadsSlice'

interface CanvasSidePanelProps {
  isExpanded: boolean
  onToggle: () => void
  /** Controlled tab — Dashboard drives this so section clicks auto-switch to Chat */
  activeTab: PanelTab
  onTabChange: (tab: PanelTab) => void
}

const API_BASE = import.meta.env.VITE_LEAN_CANVAS_API_URL ?? 'http://localhost:3026'

const SECTION_LABELS: Record<CanvasSection, string> = {
  PROBLEM: 'Problem', SOLUTION: 'Solution', VALUE_PROPOSITION: 'Value Proposition',
  KEY_METRICS: 'Key Metrics', CUSTOMER_SEGMENTS: 'Customer Segments', CHANNELS: 'Channels',
  COST_STRUCTURE: 'Cost Structure', REVENUE_STREAMS: 'Revenue Streams',
  UNFAIR_ADVANTAGE: 'Unfair Advantage',
}

// ── Sessions panel ────────────────────────────────────────────────────────────

function SessionsPanel({ onTabChange }: { onTabChange: (tab: PanelTab) => void }) {
  const dispatch = useAppDispatch()
  const threads = useAppSelector(s => s.threads.threads)
  const activeThreadId = useAppSelector(s => s.threads.activeThreadId)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleAdd = () => {
    dispatch(addThread(`Canvas ${threads.length + 1}`))
  }

  const handleSwitch = (id: string) => {
    if (id === activeThreadId) { onTabChange('chat'); return }
    dispatch(switchThread(id))
    onTabChange('chat')
  }

  const handleRenameCommit = (id: string) => {
    if (editValue.trim()) dispatch(renameThread({ id, name: editValue.trim() }))
    setEditingId(null)
    setEditValue('')
  }

  return (
    <div className="canvas-panel-body">
      <div className="canvas-panel-section-header">
        <span>Canvas sessions</span>
        <button className="canvas-panel-icon-btn canvas-panel-icon-btn--primary" onClick={handleAdd} title="New session">
          <Add size={16} />
        </button>
      </div>

      <ul className="canvas-sessions-list">
        {threads.map(thread => (
          <li
            key={thread.id}
            className={`canvas-session-item${thread.id === activeThreadId ? ' active' : ''}`}
          >
            {editingId === thread.id ? (
              <input
                className="canvas-session-rename-input"
                value={editValue}
                autoFocus
                onChange={e => setEditValue(e.target.value)}
                onBlur={() => handleRenameCommit(thread.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleRenameCommit(thread.id)
                  if (e.key === 'Escape') { setEditingId(null); setEditValue('') }
                  e.stopPropagation()
                }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <div className="canvas-session-item-content" onClick={() => handleSwitch(thread.id)}>
                <span
                  className="canvas-session-item-name"
                  onDoubleClick={e => {
                    e.stopPropagation()
                    setEditingId(thread.id)
                    setEditValue(thread.name)
                  }}
                >
                  {thread.name}
                </span>
                <span className="canvas-session-item-date">
                  {new Date(thread.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
            {threads.length > 1 && editingId !== thread.id && (
              <button
                className="canvas-session-item-delete"
                onClick={e => { e.stopPropagation(); dispatch(removeThread(thread.id)) }}
                title="Remove session"
              >
                <TrashCan size={14} />
              </button>
            )}
          </li>
        ))}
      </ul>

      <p className="canvas-panel-hint">Double-click a session name to rename it.</p>
    </div>
  )
}

// ── Chat panel ────────────────────────────────────────────────────────────────

function ChatPanel() {
  const dispatch = useAppDispatch()
  const messages = useAppSelector(s => s.chat.messages)
  const draftInput = useAppSelector(s => s.chat.draftInput)
  const isLoading = useAppSelector(s => s.chat.isLoading)
  const streamingContent = useAppSelector(s => s.chat.streamingContent)
  const activeSection = useAppSelector(s => s.canvas.activeSection)
  const activeThreadId = useAppSelector(s => s.threads.activeThreadId)

  const contextSection: CanvasSection = activeSection ?? 'PROBLEM'
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSend = useCallback(async (text?: string) => {
    const userText = (text ?? draftInput).trim()
    if (!userText || isLoading) return

    dispatch(addMessage({ role: 'user', content: userText }))
    dispatch(setDraftInput(''))
    dispatch(setIsLoading(true))
    dispatch(setStreamingContent(''))

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
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }, [handleSend])

  const contextLabel = activeSection
    ? `${SECTION_LABELS[activeSection]}`
    : 'Canvas'

  return (
    <div className="canvas-chat-panel">
      {/* Context indicator */}
      <div className="canvas-chat-context-bar">
        <ChatBot size={14} />
        <span>Asking about: <strong>{contextLabel}</strong></span>
      </div>

      {/* Messages */}
      <div className="canvas-chat-messages">
        {messages.length === 0 && !isLoading && (
          <div className="canvas-chat-empty">
            Click a canvas section, then ask a question about it here.
          </div>
        )}
        {messages.map((msg, idx) => (
          <Tile key={idx} className={`canvas-msg-tile ${msg.role}`}>
            <div className="canvas-msg-header">
              <strong>{msg.role === 'user' ? 'You' : 'Canvas AI'}</strong>
            </div>
            <div className="canvas-msg-content">{msg.content}</div>
          </Tile>
        ))}
        {streamingContent && (
          <Tile className="canvas-msg-tile assistant streaming">
            <div className="canvas-msg-header">
              <strong>Canvas AI</strong>
              <span className="canvas-msg-streaming">Typing…</span>
            </div>
            <div className="canvas-msg-content">{streamingContent}</div>
          </Tile>
        )}
        {isLoading && !streamingContent && (
          <Tile className="canvas-msg-tile assistant">
            <InlineLoading description="Thinking…" />
          </Tile>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="canvas-chat-input-area">
        <TextArea
          ref={textAreaRef}
          labelText=""
          placeholder="Ask about this section…"
          value={draftInput}
          onChange={e => dispatch(setDraftInput(e.target.value))}
          onKeyDown={handleKeyDown}
          rows={3}
          className="canvas-chat-textarea"
        />
        <div className="canvas-chat-send-row">
          <Button
            renderIcon={SendAlt}
            onClick={() => handleSend()}
            disabled={!draftInput.trim() || isLoading}
            size="sm"
            kind="primary"
            hasIconOnly
            iconDescription="Send"
          />
        </div>
      </div>
    </div>
  )
}

// ── Side panel shell ──────────────────────────────────────────────────────────

export default function CanvasSidePanel({ isExpanded, onToggle, activeTab, onTabChange }: CanvasSidePanelProps) {
  return (
    <div {...(!isExpanded ? { inert: '' } : {})}>
      <div
        className={`canvas-side-panel${isExpanded ? ' expanded' : ''}`}
        data-element="canvas-side-panel"
      >
        {/* Tab bar */}
        <div className="canvas-panel-tabs">
          <button
            className={`canvas-panel-tab${activeTab === 'sessions' ? ' active' : ''}`}
            onClick={() => onTabChange('sessions')}
          >
            <List size={16} />
            Sessions
          </button>
          <button
            className={`canvas-panel-tab${activeTab === 'chat' ? ' active' : ''}`}
            onClick={() => onTabChange('chat')}
          >
            <ChatBot size={16} />
            Chat
          </button>
          <div className="canvas-panel-tabs-spacer" />
          <IconButton
            label="Close panel"
            onClick={onToggle}
            size="sm"
            kind="ghost"
            className="canvas-panel-close"
          >
            ×
          </IconButton>
        </div>

        {/* Panel content */}
        {activeTab === 'sessions' ? (
          <SessionsPanel onTabChange={onTabChange} />
        ) : (
          <ChatPanel />
        )}
      </div>
    </div>
  )
}
