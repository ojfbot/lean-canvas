import React, { useState } from 'react'
import { Tile, TextInput, Button } from '@carbon/react'
import type { CanvasSection } from '@lean-canvas/shared'

// ADR-0020: NO Redux imports in this file — props-in/callbacks-out only.
// State wiring belongs in LeanCanvasGrid (the app layer).

interface LeanCanvasSectionPanelProps {
  section: CanvasSection
  style?: React.CSSProperties
}

const SECTION_LABELS: Record<CanvasSection, string> = {
  PROBLEM:           'Problem',
  SOLUTION:          'Solution',
  VALUE_PROPOSITION: 'Value Proposition',
  KEY_METRICS:       'Key Metrics',
  CUSTOMER_SEGMENTS: 'Customer Segments',
  CHANNELS:          'Channels',
  COST_STRUCTURE:    'Cost Structure',
  REVENUE_STREAMS:   'Revenue Streams',
  UNFAIR_ADVANTAGE:  'Unfair Advantage',
}

const API_BASE = import.meta.env.VITE_LEAN_CANVAS_API_URL ?? 'http://localhost:3021'

export default function LeanCanvasSectionPanel({ section, style }: LeanCanvasSectionPanelProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [loading, setLoading] = useState(false)
  const [threadId] = useState(() => `${section}-${Date.now()}`)

  const submit = async () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/canvas/${section}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          threadId,
          conversationHistory: messages,
        }),
      })
      const data = await res.json() as { content: string }
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: could not reach API.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Tile
      style={{
        ...style,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--cds-layer)',
        padding: '1rem',
        overflow: 'hidden',
      }}
    >
      <h4 style={{ color: 'var(--cds-text-secondary)', fontSize: '0.75rem', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
        {SECTION_LABELS[section]}
      </h4>

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
        {messages.map((m, i) => (
          <p key={i} style={{ color: m.role === 'user' ? 'var(--cds-text-primary)' : 'var(--cds-text-secondary)', margin: '0.25rem 0' }}>
            {m.content}
          </p>
        ))}
        {loading && <p style={{ color: 'var(--cds-text-placeholder)' }}>Thinking…</p>}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <TextInput
          id={`input-${section}`}
          labelText=""
          hideLabel
          size="sm"
          placeholder={`Ask about ${SECTION_LABELS[section]}…`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        <Button size="sm" onClick={submit} disabled={loading}>
          Send
        </Button>
      </div>
    </Tile>
  )
}
