import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface CanvasThreadEntry {
  id: string
  name: string
  createdAt: string
}

export type PanelTab = 'sessions' | 'chat'

interface ThreadsSliceState {
  threads: CanvasThreadEntry[]
  activeThreadId: string
  sidebarExpanded: boolean
  activePanelTab: PanelTab
}

function now() { return new Date().toISOString() }

const defaultThread: CanvasThreadEntry = {
  id: 'default',
  name: 'My Canvas',
  createdAt: now(),
}

const initialState: ThreadsSliceState = {
  threads: [defaultThread],
  activeThreadId: 'default',
  sidebarExpanded: false,
  activePanelTab: 'sessions',
}

const threadsSlice = createSlice({
  name: 'threads',
  initialState,
  reducers: {
    addThread(state, action: PayloadAction<string>) {
      const thread: CanvasThreadEntry = {
        id: crypto.randomUUID(),
        name: action.payload,
        createdAt: now(),
      }
      state.threads.push(thread)
      state.activeThreadId = thread.id
    },
    switchThread(state, action: PayloadAction<string>) {
      if (state.threads.some(t => t.id === action.payload)) {
        state.activeThreadId = action.payload
      }
    },
    renameThread(state, action: PayloadAction<{ id: string; name: string }>) {
      const t = state.threads.find(t => t.id === action.payload.id)
      if (t) t.name = action.payload.name
    },
    removeThread(state, action: PayloadAction<string>) {
      if (state.threads.length <= 1) return
      state.threads = state.threads.filter(t => t.id !== action.payload)
      if (state.activeThreadId === action.payload) {
        state.activeThreadId = state.threads[state.threads.length - 1].id
      }
    },
    setSidebarExpanded(state, action: PayloadAction<boolean>) {
      state.sidebarExpanded = action.payload
    },
    setPanelTab(state, action: PayloadAction<PanelTab>) {
      state.activePanelTab = action.payload
    },
  },
})

export const { addThread, switchThread, renameThread, removeThread, setSidebarExpanded, setPanelTab } =
  threadsSlice.actions

export default threadsSlice.reducer
