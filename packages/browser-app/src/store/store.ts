import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import canvasReducer from './canvasSlice'
import chatReducer from './chatSlice'
import threadsReducer from './threadsSlice'

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
    chat: chatReducer,
    threads: threadsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = <T>(selector: (state: RootState) => T) => useSelector(selector)
