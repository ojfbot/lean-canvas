import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CanvasSection, CanvasThread } from '@lean-canvas/shared'

interface CanvasSliceState {
  activeSection: CanvasSection | null
  threads: Record<string, CanvasThread[]>
  activePanelId: string | null
}

const initialState: CanvasSliceState = {
  activeSection: null,
  threads: {},
  activePanelId: null,
}

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setActiveSection(state, action: PayloadAction<CanvasSection | null>) {
      state.activeSection = action.payload
      state.activePanelId = action.payload
    },
    addThread(state, action: PayloadAction<{ section: CanvasSection; thread: CanvasThread }>) {
      const { section, thread } = action.payload
      if (!state.threads[section]) state.threads[section] = []
      state.threads[section].push(thread)
    },
    clearActiveSection(state) {
      state.activeSection = null
      state.activePanelId = null
    },
  },
})

export const { setActiveSection, addThread, clearActiveSection } = canvasSlice.actions
export default canvasSlice.reducer
