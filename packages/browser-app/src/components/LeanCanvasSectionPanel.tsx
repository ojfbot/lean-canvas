import React, { useState } from 'react'
import { Tile, TextInput } from '@carbon/react'
import { SendAlt } from '@carbon/icons-react'
import type { CanvasSection } from '@lean-canvas/shared'

// ADR-0020: NO Redux imports in this file — props-in/callbacks-out only.
// State wiring belongs in LeanCanvasGrid (the app layer).

interface LeanCanvasSectionPanelProps {
  section: CanvasSection
  style?: React.CSSProperties
  /** Called when the panel gains focus — lets parent update active section in Redux. */
  onFocus?: () => void
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

const API_BASE = import.meta.env.VITE_LEAN_CANVAS_API_URL ?? 'http://localhost:3026'

// Blue Ocean starter prompts — shown as initial assistant message in each section.
const BLUE_OCEAN_PROMPTS: Record<CanvasSection, string> = {
  PROBLEM:           'What top 1–3 problems do customers face today that existing solutions fail to solve? Consider both direct pain points and "nonconsumers" who avoid the market entirely.',
  SOLUTION:          'What is the simplest possible solution to each problem above? Focus on eliminating or reducing factors that make the current market unattractive.',
  VALUE_PROPOSITION: 'What single compelling message makes competition irrelevant? Describe the leap in value you create — not incremental improvement, but a new value curve.',
  KEY_METRICS:       'What 1–3 metrics signal you are creating real value? Think AARRR: Acquisition → Activation → Retention → Revenue → Referral.',
  CUSTOMER_SEGMENTS: 'Who are your early adopters? Include "noncustomers" — people who currently avoid or opt out of the market — as they reveal blue ocean opportunities.',
  CHANNELS:          'How will you reach segments efficiently? List the lowest-cost, highest-trust paths to your earliest adopters.',
  COST_STRUCTURE:    'What are your key cost drivers? Identify which costs you can eliminate, reduce, raise, or create to break the value-cost trade-off.',
  REVENUE_STREAMS:   'How will you capture value? Consider pricing models that unlock new demand: subscription, usage-based, freemium, or value-based pricing.',
  UNFAIR_ADVANTAGE:  'What cannot be easily copied or bought? Network effects, proprietary data, brand, regulatory advantage, or a unique team composition.',
}

export default function LeanCanvasSectionPanel({ section, style, onFocus }: LeanCanvasSectionPanelProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>(() => [
    { role: 'assistant', content: BLUE_OCEAN_PROMPTS[section] },
  ])
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
        body: JSON.stringify({ message: userMsg, threadId, conversationHistory: messages }),
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
        padding: '0.625rem',
        overflow: 'hidden',
      }}
      onClick={onFocus}
    >
      <h4 style={{
        color: 'var(--cds-text-secondary)',
        fontSize: '0.6875rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        marginBottom: '0.375rem',
        flexShrink: 0,
      }}>
        {SECTION_LABELS[section]}
      </h4>

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '0.375rem', fontSize: '0.8125rem', minHeight: 0 }}>
        {messages.map((m, i) => (
          <p key={i} style={{
            color: m.role === 'user' ? 'var(--cds-text-primary)' : 'var(--cds-text-secondary)',
            margin: '0.2rem 0',
            lineHeight: 1.4,
          }}>
            {m.content}
          </p>
        ))}
        {loading && <p style={{ color: 'var(--cds-text-placeholder)', fontSize: '0.75rem' }}>Thinking…</p>}
      </div>

      {/* Input row — icon-only send button, square, compact */}
      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexShrink: 0 }}>
        <TextInput
          id={`input-${section}`}
          labelText=""
          hideLabel
          size="sm"
          placeholder={`Ask…`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          onClick={e => e.stopPropagation()}
        />
        <button
          onClick={e => { e.stopPropagation(); submit() }}
          disabled={loading || !input.trim()}
          title="Send"
          style={{
            flexShrink: 0,
            width: '2rem',
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: loading || !input.trim()
              ? 'var(--cds-button-disabled)'
              : 'var(--cds-button-primary)',
            border: 'none',
            borderRadius: '2px',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            color: 'var(--cds-text-on-color)',
            transition: 'background 0.15s',
          }}
        >
          <SendAlt size={16} />
        </button>
      </div>
    </Tile>
  )
}
