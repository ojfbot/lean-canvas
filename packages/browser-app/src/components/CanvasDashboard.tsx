import { Provider } from 'react-redux'
import { store } from '../store/store'
import { useAppDispatch, useAppSelector } from '../store/store'
import { setSidebarExpanded } from '../store/threadsSlice'
import { Tooltip } from '@carbon/react'
import { Menu, Close } from '@carbon/icons-react'
import LeanCanvasGrid from './LeanCanvasGrid'
import CanvasCondensedChat from './CanvasCondensedChat'
import CanvasThreadSidebar from './CanvasThreadSidebar'
import './CanvasDashboard.css'

interface CanvasDashboardProps {
  /** True when mounted inside the Frame shell. Suppresses standalone chrome. */
  shellMode?: boolean
}

function CanvasDashboardContent({ shellMode }: CanvasDashboardProps) {
  const dispatch = useAppDispatch()
  const sidebarExpanded = useAppSelector(s => s.threads.sidebarExpanded)
  const activeThreadId = useAppSelector(s => s.threads.activeThreadId)
  const threads = useAppSelector(s => s.threads.threads)
  const activeThread = threads.find(t => t.id === activeThreadId)

  return (
    <div
      className={[
        'canvas-dashboard',
        sidebarExpanded ? 'with-sidebar' : '',
        shellMode ? 'shell-mode' : '',
      ].filter(Boolean).join(' ')}
      data-element="canvas-dashboard"
    >
      {/* Thread sidebar */}
      {sidebarExpanded && <CanvasThreadSidebar />}

      {/* Main area */}
      <div className="canvas-dashboard-main">
        {/* Header */}
        <div className="canvas-dashboard-header">
          <div className="canvas-dashboard-title-row">
            {!shellMode && (
              <h2 className="canvas-dashboard-title">Lean Canvas</h2>
            )}
            <span className="canvas-dashboard-session-name">
              {activeThread?.name ?? 'My Canvas'}
            </span>
          </div>

          <div className="canvas-dashboard-header-actions">
            <Tooltip
              align="bottom-right"
              label={sidebarExpanded ? 'Close sessions' : 'Switch session'}
            >
              <button
                className="canvas-sidebar-toggle"
                onClick={() => dispatch(setSidebarExpanded(!sidebarExpanded))}
                aria-label="Toggle session sidebar"
              >
                {sidebarExpanded ? <Close size={20} /> : <Menu size={20} />}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* 9-section canvas grid */}
        <div className="canvas-dashboard-grid-wrapper">
          <LeanCanvasGrid shellMode={shellMode} />
        </div>

        {/* Condensed chat — sticky to bottom of main area */}
        <CanvasCondensedChat />
      </div>
    </div>
  )
}

// Self-contained export for Module Federation. Carries its own store; shell Provider is outer.
// Double-wrap is intentional and harmless (inner wins). See app-templates.md invariant.
export default function CanvasDashboard(props: CanvasDashboardProps) {
  return (
    <Provider store={store}>
      <CanvasDashboardContent {...props} />
    </Provider>
  )
}
