import React from 'react'
import CanvasDashboard from './components/CanvasDashboard'

// Standalone dev wrapper — CanvasDashboard carries its own Provider.
// When loaded as a Module Federation remote, the shell renders CanvasDashboard directly.
export default function App() {
  return (
    <div style={{ background: '#161616', minHeight: '100vh' }}>
      <CanvasDashboard shellMode={false} />
    </div>
  )
}
