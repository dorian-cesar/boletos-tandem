import { createSlice } from '@reduxjs/toolkit'
import LocalStorageEntities from 'entities/LocalStorageEntities';
import { decryptData, encryptData, encryptDataNoTime } from 'utils/encrypt-data';



let initialState = {
    idSistema: 7,
    integrador: 1000,
    carroCuponera: {}
}

if (typeof window !== 'undefined') {
    if ( localStorage.getItem(LocalStorageEntities.cup) ) {
        let data = decryptData(LocalStorageEntities.cup);
        if( data ) {
            initialState = data;
        } 
    }
}

export const compraCuponeraSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        agregarCuponera: (state, action) => {
            state.carroCuponera = action.payload;
            encryptData(state, LocalStorageEntities.cup, Date.now() + (15 * 60 * 1000));
        },
        agregarComprador: (state, action) => {
            const { rut, tipoRut, email, nombre, apellido } = action.payload;
            const rutReplace = (rut != null) ? rut.replace(/\./g, '') : '';
            state.email = email;
            state.rut = rutReplace;
            state.nombre = nombre;
            state.apellido = apellido;
            state.tipoDocumento = tipoRut;
        },
        agregarMedioPago: (state, action) =>{
            const { tipoMedioPago } = action.payload;
            state.medioDePago = tipoMedioPago;
        },
        agregarMontoTotal: (state, action) =>{
            const { valorTotalCuponera } = action.payload;
            state.montoTotal = valorTotalCuponera;
        },
        limpiarCuponera: (state, action) => {
            state.carroCuponera = {}
            state.email = '';
            state.rut = '';
            state.nombre = '';
            state.apellido = '';
            state.tipoDocumento = '';
            state.medioDePago = '';
            state.montoTotal = '';
            state.live_time = null;
            localStorage.removeItem(LocalStorageEntities.cup);
        }
    },
});

export const { agregarCuponera, agregarComprador, agregarMedioPago, agregarMontoTotal, limpiarCuponera } = compraCuponeraSlice.actions;

export default compraCuponeraSlice.reducer;