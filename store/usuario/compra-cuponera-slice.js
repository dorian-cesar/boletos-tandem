import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    idSistema: 7,
    integrador: 1000,
    carroCuponera: {}
}

export const compraCuponeraSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        agregarCuponera: (state, action) => {
            state.carroCuponera = action.payload;
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
        }
    },
});

export const { agregarCuponera, agregarComprador, agregarMedioPago, agregarMontoTotal } = compraCuponeraSlice.actions;

export default compraCuponeraSlice.reducer;