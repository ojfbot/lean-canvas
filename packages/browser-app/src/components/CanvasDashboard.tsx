import { Provider } from 'react-redux'
import { store } from '../store/store'
import { useAppDispatch, useAppSelector } from '../store/store'
import { setSidebarExpanded, setPanelTab } from '../store/threadsSlice'

import { DashboardLayout } from '@ojfbot/frame-ui-components'
import { Heading, Tooltip } from '@carbon/react'
import { Menu, Close } from '@carbon/icons-react'
import LeanCanvasGrid from './LeanCanvasGrid'
import CanvasSidePanel from './CanvasSidePanel'
import './CanvasDashboard.css'
import './CanvasSidePanel.css'

interface CanvasDashboardProps {
  shellMode?: boolean
}

function CanvasDashboardContent({ shellMode }: CanvasDashboardProps) {
  const dispatch = useAppDispatch()
  const sidebarExpanded = useAppSelector(s => s.threads.sidebarExpanded)
  const activePanelTab = useAppSelector(s => s.threads.activePanelTab)

  return (
    <>
      {/* Right-rail side panel — Sessions + Chat tabs, no overlap with grid */}
      <CanvasSidePanel
        isExpanded={sidebarExpanded}
        onToggle={() => dispatch(setSidebarExpanded(!sidebarExpanded))}
        activeTab={activePanelTab}
        onTabChange={tab => dispatch(setPanelTab(tab))}
      />

      {/* Main dashboard panel — right margin clears the side panel when open */}
      <DashboardLayout shellMode={shellMode} sidebarExpanded={sidebarExpanded}>
        <DashboardLayout.Header>
          <Heading className="page-header">Lean Canvas</Heading>

          <div className="canvas-header-actions">
            <Tooltip
              align="bottom-right"
              label={sidebarExpanded ? 'Close panel' : 'Sessions & Chat'}
            >
              <button
                className="sidebar-toggle-btn"
                onClick={() => dispatch(setSidebarExpanded(!sidebarExpanded))}
                aria-label="Toggle sessions / chat panel"
              >
                {sidebarExpanded ? <Close size={20} /> : <Menu size={20} />}
              </button>
            </Tooltip>
          </div>
        </DashboardLayout.Header>

        <div className="canvas-grid-scroller">
          <LeanCanvasGrid shellMode={shellMode} />
        </div>
      </DashboardLayout>
    </>
  )
}

export default function CanvasDashboard(props: CanvasDashboardProps) {
  return (
    <Provider store={store}>
      <CanvasDashboardContent {...props} />
    </Provider>
  )
}
