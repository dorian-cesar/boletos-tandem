import { createSlice } from '@reduxjs/toolkit'
import LocalStorageEntities from 'entities/LocalStorageEntities';
import { decryptData, encryptData, encryptDataNoTime } from 'utils/encrypt-data';


let initialState = {
    archivo: {},
    resultado: {},
    voucher: {},
}

if (typeof window !== 'undefined') {
    if ( localStorage.getItem(LocalStorageEntities.cam) ) {
        let data = decryptData(LocalStorageEntities.cam);
        if( data ) {
            initialState = data;
        } 
    }
}

export const cambioBoletoSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        agregarCambio: (state, action) => {
            debugger;
            const { archivo, resultado, voucher } = action.payload;
            state.archivo = archivo;
            state.resultado = resultado;
            state.voucher = voucher;
            encryptData(state, LocalStorageEntities.cam, Date.now() + (15 * 60 * 1000));
        },
        limpiarCambio: (state, action) => {
            state.archivo = {};
            state.resultado = {};
            state.voucher = {};
            state.cambioBoleto = {};
            localStorage.removeItem(LocalStorageEntities.cam);
        }
    },
});


export const { agregarCambio, limpiarCambio } = cambioBoletoSlice.actions;

export default cambioBoletoSlice.reducer;