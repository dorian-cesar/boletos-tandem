import { configureStore } from '@reduxjs/toolkit'
import compraSlice from './usuario/compra-slice'
import compraCuponeraSlice from './usuario/compra-cuponera-slice'
import cambioBoletoSlice from './usuario/cambio-boleto-slice'

export const store = configureStore({
  reducer: {
    compra: compraSlice,
    compraCuponera: compraCuponeraSlice,
    cambioBoleto: cambioBoletoSlice
  },
})