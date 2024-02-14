import { createSlice } from '@reduxjs/toolkit'
import LocalStorageEntities from 'entities/LocalStorageEntities';
import { decryptData, encryptData, encryptDataNoTime } from 'utils/encrypt-data';

let initialState = {
    idSistema: 7,
    listaCarrito: {}
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
            debugger;
            const { payload } = action;
            let key = '';
            
            if( payload.tipoServicio === 'ida' ) { 
                // key = `${payload.servicio.idTerminalOrigen}-${payload.servicio.idTerminalDestino}-${payload.servicio.fechaSalida.replace(/\//g, "")}`;
                key = `${payload.servicio.idTerminalOrigen}-${payload.servicio.idTerminalDestino}`;
            } else {
                key = `${payload.servicio.idTerminalDestino}-${payload.servicio.idTerminalOrigen}`;
            }

            if( Object.keys(state.listaCarrito).length === 0 ) {
                state.listaCarrito[key] = {};
                const previewValues = state.listaCarrito[key][payload.tipoServicio] || [];
                previewValues.push(payload);
                state.listaCarrito[key][payload.tipoServicio] = previewValues;
                encryptData(state, LocalStorageEntities.car, Date.now() + (15 * 60 * 1000))
            } else {
                if( state.listaCarrito[key] ) {
                    if( state.listaCarrito[key][payload.tipoServicio] ) {
                        state.listaCarrito[key][payload.tipoServicio].push(payload);
                    } else {
                        state.listaCarrito[key][payload.tipoServicio] = [payload]
                    }
                }
                encryptDataNoTime(state, LocalStorageEntities.car);
            }
        },
        agregarPasajero: (state) => {

        },
        eliminarServicio: (state, action) => {
            debugger;
            const { payload } = action;
            let key = '';
            
            if( payload.tipoServicio === 'ida' ) { 
                // key = `${payload.servicio.idTerminalOrigen}-${payload.servicio.idTerminalDestino}-${payload.servicio.fechaSalida.replace(/\//g, "")}`;
                key = `${payload.servicio.idTerminalOrigen}-${payload.servicio.idTerminalDestino}`;
            } else {
                key = `${payload.servicio.idTerminalDestino}-${payload.servicio.idTerminalOrigen}`;
            }

            if( state.listaCarrito[key] ) {
                if( state.listaCarrito[key][payload.tipoServicio] ) {
                    const newArray = state.listaCarrito[key][payload.tipoServicio].filter((carrito) => {
                        return !(carrito.servicio.idServicio === payload.servicio.idServicio && carrito.asiento.asiento === payload.asiento.asiento);
                    });
                    state.listaCarrito[key][payload.tipoServicio] = newArray;
                    if( newArray.length === 0 ) delete state.live_time;
                encryptDataNoTime(state, LocalStorageEntities.car); 
                }
            }
        }
    },
});

export const { agregarServicio, agregarPasajero, eliminarServicio } = compraSlice.actions;

export default compraSlice.reducer;