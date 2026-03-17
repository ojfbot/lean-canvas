import { useAppDispatch } from '../store/store'
import { setActiveSection } from '../store/canvasSlice'
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

// ADR-0020: Redux access via hooks; props-out to child panels.
// Provider lives in CanvasDashboard (MF boundary). Grid is a pure layout component.
export default function LeanCanvasGrid({ shellMode = false }: LeanCanvasGridProps) {
  const dispatch = useAppDispatch()

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
          onFocus={() => dispatch(setActiveSection(section))}
        />
      ))}
    </div>
  )
}
