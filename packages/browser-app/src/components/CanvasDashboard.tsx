import { Provider } from 'react-redux'
import { store } from '../store/store'
import { useAppDispatch, useAppSelector } from '../store/store'
import { setSidebarExpanded } from '../store/threadsSlice'

import { DashboardLayout, ErrorBoundary, SidebarToggle } from '@ojfbot/frame-ui-components'
import '@ojfbot/frame-ui-components/styles/dashboard-layout'
import { Heading } from '@carbon/react'
import LeanCanvasGrid from './LeanCanvasGrid'
import ThreadSidebarConnected from './ThreadSidebarConnected'
import CondensedChat from './CondensedChat'
import './CanvasDashboard.css'

interface CanvasDashboardProps {
  shellMode?: boolean
}

function CanvasDashboardContent({ shellMode }: CanvasDashboardProps) {
  const dispatch = useAppDispatch()
  const sidebarExpanded = useAppSelector(s => s.threads.sidebarExpanded)
  const chatExpanded = useAppSelector(s => s.chat.displayState === 'expanded')

  return (
    <>
      <ThreadSidebarConnected
        isExpanded={sidebarExpanded}
        onToggle={() => dispatch(setSidebarExpanded(!sidebarExpanded))}
      />

      <DashboardLayout
        shellMode={shellMode}
        sidebarExpanded={sidebarExpanded}
        chatExpanded={chatExpanded}
      >
        <DashboardLayout.Header>
          <Heading className="page-header">Lean Canvas</Heading>
          <SidebarToggle isExpanded={sidebarExpanded} onToggle={() => dispatch(setSidebarExpanded(!sidebarExpanded))} />
        </DashboardLayout.Header>

        <div className="canvas-grid-scroller">
          <LeanCanvasGrid shellMode={shellMode} />
        </div>
      </DashboardLayout>

      <CondensedChat sidebarExpanded={sidebarExpanded} />
    </>
  )
}

export default function CanvasDashboard(props: CanvasDashboardProps) {
  return (
    <Provider store={store}>
      <ErrorBoundary appName="lean-canvas" boundaryName="canvas-dashboard">
        <CanvasDashboardContent {...props} />
      </ErrorBoundary>
    </Provider>
  )
}
