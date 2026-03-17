import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ChatDisplayState = 'collapsed' | 'expanded'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatSliceState {
  messages: ChatMessage[]
  draftInput: string
  isLoading: boolean
  streamingContent: string
  displayState: ChatDisplayState
}

const initialState: ChatSliceState = {
  messages: [],
  draftInput: '',
  isLoading: false,
  streamingContent: '',
  displayState: 'collapsed',
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload)
    },
    setDraftInput(state, action: PayloadAction<string>) {
      state.draftInput = action.payload
    },
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
    setStreamingContent(state, action: PayloadAction<string>) {
      state.streamingContent = action.payload
    },
    setDisplayState(state, action: PayloadAction<ChatDisplayState>) {
      state.displayState = action.payload
    },
    clearMessages(state) {
      state.messages = []
      state.streamingContent = ''
      state.draftInput = ''
    },
  },
})

export const {
  addMessage,
  setDraftInput,
  setIsLoading,
  setStreamingContent,
  setDisplayState,
  clearMessages,
} = chatSlice.actions

export default chatSlice.reducer
