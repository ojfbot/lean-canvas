import React from 'react'
import { Provider } from 'react-redux'
import { store } from './store/store'
import LeanCanvasGrid from './components/LeanCanvasGrid'

// Standalone dev wrapper — adds mock shell chrome for local development.
// When loaded as a Module Federation remote, the shell renders Dashboard directly.
export default function App() {
  return (
    <Provider store={store}>
      <div style={{ padding: '1rem', background: '#161616', minHeight: '100vh' }}>
        <LeanCanvasGrid shellMode={false} />
      </div>
    </Provider>
  )
}
