import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    idSistema: 7,
    listaCarrito: []
}

export const compraSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        agregarServicio: (state, action) => {
            state.listaCarrito.push(action.payload);
        },
        agregarAlCarrito: (state, action) => {
            state
            .listaCarrito
            ?.find(servicio => servicio.servicio === action.payload.servicio)
            ?.pasajero?.push(action.payload.pasajero);
        },
        agregarPasajero: (state) => {

        }
    },
});

export const { agregarServicio, agregarPasajero } = compraSlice.actions;

export default compraSlice.reducer;