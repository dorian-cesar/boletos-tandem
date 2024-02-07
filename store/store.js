import { configureStore } from '@reduxjs/toolkit'
import compraSlice from './usuario/compra-slice'

export const store = configureStore({
  reducer: {
    compra: compraSlice
  },
})