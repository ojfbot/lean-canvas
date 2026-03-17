import { useAppDispatch } from '../store/store'
import { setActiveSection } from '../store/canvasSlice'
import LeanCanvasSectionPanel from './LeanCanvasSectionPanel'
import type { CanvasSection } from '@lean-canvas/shared'

interface LeanCanvasGridProps {
  shellMode?: boolean
  /** Called when a section tile is clicked — lets parent open Chat tab in the side panel. */
  onSectionFocus?: () => void
}

// Grid layout — 6 equal columns so cost and revenue are exactly 50/50:
//
//  col:  1        2        3         4         5        6
//  ┌─────────┬────────┬──────────────────────┬─────────┬──────────────┐
//  │ PROBLEM │SOLUTION│   VALUE PROPOSITION  │ UNFAIR  │  CUSTOMER    │  row 1
//  │         │        │                      │ADVANTAGE│  SEGMENTS    │
//  ├─────────┴────────┤                      ├─────────┴──────────────┤
//  │   KEY METRICS    │                      │      CHANNELS          │  row 2
//  ├──────────────────┴──────────────────────┼────────────────────────┤
//  │        COST STRUCTURE (50%)             │  REVENUE STREAMS (50%) │  row 3
//  └─────────────────────────────────────────┴────────────────────────┘
//
// cost = cols 1-3, revenue = cols 4-6 → exactly equal width.

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
export default function LeanCanvasGrid({ shellMode = false, onSectionFocus }: LeanCanvasGridProps) {
  const dispatch = useAppDispatch()

  return (
    <div
      className={`lean-canvas-grid${shellMode ? ' shell-mode' : ''}`}
      style={{
        display: 'grid',
        // 6 equal columns — cost (cols 1-3) and revenue (cols 4-6) are exactly 50% each
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridTemplateAreas: `
          "problem  solution  value    value    advantage segments"
          "metrics  metrics   value    value    channels  channels"
          "cost     cost      cost     revenue  revenue   revenue"
        `,
        // 3 equal rows — fills container height without overflow
        gridTemplateRows: '1fr 1fr 1fr',
        gap: '1px',
        background: 'var(--cds-border-subtle)',
        // Fill the scroller height exactly — no minHeight that would force overflow
        height: '100%',
        minHeight: shellMode ? 0 : '600px',
      }}
    >
      {CANVAS_LAYOUT.map(({ section, gridArea }) => (
        <LeanCanvasSectionPanel
          key={section}
          section={section}
          style={{ gridArea }}
          onFocus={() => {
            dispatch(setActiveSection(section))
            onSectionFocus?.()
          }}
        />
      ))}
    </div>
  )
}
