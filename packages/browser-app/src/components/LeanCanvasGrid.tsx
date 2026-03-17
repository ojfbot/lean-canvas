import React from 'react'
import { Provider } from 'react-redux'
import { store } from '../store/store'
import LeanCanvasSectionPanel from './LeanCanvasSectionPanel'
import type { CanvasSection } from '@lean-canvas/shared'

interface LeanCanvasGridProps {
  shellMode?: boolean
}

// Grid layout mirrors the standard Lean Canvas structure:
//
//  ┌──────────┬──────────┬──────────────────┬──────────┬──────────────────┐
//  │ PROBLEM  │ SOLUTION │ VALUE PROPOSITION│ UNFAIR   │ CUSTOMER         │
//  │          │          │                  │ ADVANTAGE│ SEGMENTS         │
//  ├──────────┴──────────┤                  ├──────────┴──────────────────┤
//  │ KEY METRICS         │                  │ CHANNELS                    │
//  ├─────────────────────┴──────────────────┴─────────────────────────────┤
//  │ COST STRUCTURE                 │ REVENUE STREAMS                     │
//  └────────────────────────────────┴─────────────────────────────────────┘

const CANVAS_LAYOUT: Array<{ section: CanvasSection; gridArea: string }> = [
  { section: 'PROBLEM',           gridArea: 'problem' },
  { section: 'SOLUTION',          gridArea: 'solution' },
  { section: 'VALUE_PROPOSITION', gridArea: 'value' },
  { section: 'UNFAIR_ADVANTAGE',  gridArea: 'advantage' },
  { section: 'CUSTOMER_SEGMENTS', gridArea: 'segments' },
  { section: 'KEY_METRICS',       gridArea: 'metrics' },
  { section: 'CHANNELS',          gridArea: 'channels' },
  { section: 'COST_STRUCTURE',    gridArea: 'cost' },
  { section: 'REVENUE_STREAMS',   gridArea: 'revenue' },
]

// ADR-0020: Dashboard wraps in Provider so it works as MF remote (shell has no canvas slice)
function LeanCanvasGridInner({ shellMode = false }: LeanCanvasGridProps) {
  return (
    <div
      className={`lean-canvas-grid${shellMode ? ' shell-mode' : ''}`}
      style={{
        display: 'grid',
        gridTemplateAreas: `
          "problem solution value advantage segments"
          "metrics metrics value channels channels"
          "cost    cost    cost  revenue  revenue"
        `,
        gridTemplateColumns: '1fr 1fr 1.5fr 1fr 1.5fr',
        gridTemplateRows: '1fr 1fr auto',
        gap: '1px',
        background: 'var(--cds-border-subtle)',
        minHeight: shellMode ? '100%' : '80vh',
      }}
    >
      {CANVAS_LAYOUT.map(({ section, gridArea }) => (
        <LeanCanvasSectionPanel
          key={section}
          section={section}
          style={{ gridArea }}
        />
      ))}
    </div>
  )
}

// Double-Provider pattern (see app-templates.md invariant):
// Inner Provider wins when mounted standalone; shell's Provider is ignored safely.
export default function LeanCanvasGrid(props: LeanCanvasGridProps) {
  return (
    <Provider store={store}>
      <LeanCanvasGridInner {...props} />
    </Provider>
  )
}
