import { createSlice } from '@reduxjs/toolkit'
import LocalStorageEntities from 'entities/LocalStorageEntities';
import { decryptData, encryptData, encryptDataNoTime } from 'utils/encrypt-data';

let initialState = {
    idSistema: 7,
    listaCarrito: []
}

if (typeof window !== 'undefined') {
    if ( localStorage.getItem(LocalStorageEntities.car) ) {
        let data = decryptData(LocalStorageEntities.car);
        if( data ) {
            initialState = data;
        } 
    }
}

export const compraSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        agregarServicio: (state, action) => {
            if( state.listaCarrito.length === 0 ) {
                state.listaCarrito.push(action.payload);
                encryptData(state, LocalStorageEntities.car, Date.now() + (15 * 60 * 1000))
            } else {
                state.listaCarrito.push(action.payload);
                encryptDataNoTime(state, LocalStorageEntities.car);
            }
        },
        agregarAlCarrito: (state, action) => {
            state
            .listaCarrito
            ?.find(servicio => servicio.servicio === action.payload.servicio)
            ?.pasajero?.push(action.payload.pasajero);
        },
        agregarPasajero: (state) => {

        },
        eliminarServicio: (state, action) => {
            debugger;
            if( state.listaCarrito.length > 0 ){
                const { servicio, asiento } = action.payload;
                const newArray = state.listaCarrito.filter((carrito) => {
                    return !(carrito.servicio.idServicio === servicio.idServicio && carrito.asiento.asiento === asiento.asiento);
                });
                state.listaCarrito = newArray;
                if( newArray.length === 0 ) delete state.live_time;
                encryptDataNoTime(state, LocalStorageEntities.car); 
            }
        }
    },
});

export const { agregarServicio, agregarPasajero, eliminarServicio } = compraSlice.actions;

export default compraSlice.reducer;