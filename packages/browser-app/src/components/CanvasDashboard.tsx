import { Provider } from 'react-redux'
import { store } from '../store/store'
import { useAppDispatch, useAppSelector } from '../store/store'
import { setSidebarExpanded } from '../store/threadsSlice'
import { Heading, Tooltip } from '@carbon/react'
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

  return (
    <>
      {/* Thread sidebar — position:fixed, slides in from right (mirrors cv-builder ThreadSidebar) */}
      <CanvasThreadSidebar
        isExpanded={sidebarExpanded}
        onToggle={() => dispatch(setSidebarExpanded(!sidebarExpanded))}
      />

      {/* Main panel with margins matching dashboard-wrapper pattern */}
      <div
        className={[
          'canvas-dashboard-wrapper',
          sidebarExpanded ? 'with-sidebar' : '',
          shellMode ? 'shell-mode' : '',
        ].filter(Boolean).join(' ')}
        data-element="canvas-dashboard"
      >
        <div className="canvas-dashboard-header">
          <Heading className="page-header">Lean Canvas</Heading>

          <div className="canvas-header-actions">
            <Tooltip
              align="bottom-right"
              label={sidebarExpanded ? 'Close sessions' : 'Switch session'}
            >
              <button
                className="sidebar-toggle-btn"
                onClick={() => dispatch(setSidebarExpanded(!sidebarExpanded))}
                aria-label="Toggle session sidebar"
              >
                {sidebarExpanded ? <Close size={20} /> : <Menu size={20} />}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* 9-section canvas grid — fills the remaining wrapper space */}
        <div className="canvas-grid-scroller">
          <LeanCanvasGrid shellMode={shellMode} />
        </div>
      </div>

      {/* Condensed chat — position:fixed bottom-right (mirrors cv-builder CondensedChat) */}
      <CanvasCondensedChat sidebarExpanded={sidebarExpanded} />
    </>
  )
}

// Self-contained export for Module Federation. Carries its own store.
// Double-wrap is intentional and harmless — inner wins. See app-templates.md invariant.
export default function CanvasDashboard(props: CanvasDashboardProps) {
  return (
    <Provider store={store}>
      <CanvasDashboardContent {...props} />
    </Provider>
  )
}
