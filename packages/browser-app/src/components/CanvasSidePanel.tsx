import { useCallback } from 'react'
import { IconButton } from '@carbon/react'
import { ChatBot, List } from '@carbon/icons-react'
import {
  ChatShell,
  ChatMessage,
  MarkdownMessage,
  ThreadSidebar,
  BadgeButton,
  getChatMessage,
} from '@ojfbot/frame-ui-components'
import '@ojfbot/frame-ui-components/styles/chat-shell'
import '@ojfbot/frame-ui-components/styles/markdown-message'
import '@ojfbot/frame-ui-components/styles/thread-sidebar'
import '@ojfbot/frame-ui-components/styles/badge-button'
import type { ChatDisplayState, BadgeAction, ThreadItem } from '@ojfbot/frame-ui-components'
import { useAppDispatch, useAppSelector } from '../store/store'
import { addThread, switchThread, removeThread } from '../store/threadsSlice'
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

// ── Sessions panel — shared ThreadSidebar ─────────────────────────────────────

function SessionsPanel({ onTabChange }: { onTabChange: (tab: PanelTab) => void }) {
  const dispatch = useAppDispatch()
  const threads = useAppSelector(s => s.threads.threads)
  const activeThreadId = useAppSelector(s => s.threads.activeThreadId)

  const threadItems: ThreadItem[] = threads.map(t => ({
    threadId: t.id,
    title: t.name,
    updatedAt: t.createdAt,
  }))

  return (
    <div className="canvas-panel-body">
      <ThreadSidebar
        isExpanded={true}
        onToggle={() => {}}
        threads={threadItems}
        currentThreadId={activeThreadId}
        title="Canvas Sessions"
        onCreateThread={() => {
          dispatch(addThread(`Canvas ${threads.length + 1}`))
        }}
        onSelectThread={(threadId) => {
          if (threadId !== activeThreadId) dispatch(switchThread(threadId))
          onTabChange('chat')
        }}
        onDeleteThread={(threadId) => dispatch(removeThread(threadId))}
      />
    </div>
  )
}

// ── Chat panel — shared ChatShell + ChatMessage + MarkdownMessage ────────────

function ChatPanel() {
  const dispatch = useAppDispatch()
  const messages = useAppSelector(s => s.chat.messages)
  const draftInput = useAppSelector(s => s.chat.draftInput)
  const isLoading = useAppSelector(s => s.chat.isLoading)
  const streamingContent = useAppSelector(s => s.chat.streamingContent)
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
    <div className="canvas-chat-panel">
      {/* Context indicator */}
      <div className="canvas-chat-context-bar">
        <ChatBot size={14} />
        <span>Asking about: <strong>{contextLabel}</strong></span>
      </div>

      {/* Chat using shared components */}
      <ChatShell
        displayState="expanded"
        onDisplayStateChange={() => {}}
        title="Canvas AI"
        isLoading={isLoading}
        draftInput={draftInput}
        onDraftChange={(value) => dispatch(setDraftInput(value))}
        onSend={handleSend}
        placeholder="Ask about this section..."
        inputDisabled={isLoading}
        streamingContent={streamingContent ? (
          <ChatMessage role="assistant" isStreaming>
            <MarkdownMessage content={streamingContent} compact />
          </ChatMessage>
        ) : undefined}
      >
        {messages.length === 0 && !isLoading && (
          <div className="canvas-chat-empty">
            Click a canvas section, then ask a question about it here.
          </div>
        )}
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
            x
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
