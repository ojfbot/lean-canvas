import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import canvasReducer from './canvasSlice'

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = <T>(selector: (state: RootState) => T) => useSelector(selector)
