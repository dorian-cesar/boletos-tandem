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
                key = `${payload.servicio.idTerminalOrigen}-${payload.servicio.idTerminalDestino}`;
            } else {
                key = `${payload.servicio.idTerminalDestino}-${payload.servicio.idTerminalOrigen}`;
            }

            if( Object.keys(state.listaCarrito).length === 0 ) {
                state.listaCarrito[key] = {};
                const listaServicios = state.listaCarrito[key][payload.tipoServicio] || [];
                let servicio = listaServicios.find((servicio) => servicio.idServicio === payload.servicio.idServicio);
                if( servicio ) {
                    servicio.asientos.push(payload.asiento);
                } else {
                    delete payload.servicio.logo;
                    listaServicios.push({
                        ...payload.servicio,
                        asientos: [payload.asiento]
                    });
                }
                state.listaCarrito[key][payload.tipoServicio] = listaServicios;
                encryptData(state, LocalStorageEntities.car, Date.now() + (15 * 60 * 1000))
            } else {
                if( state.listaCarrito[key] ) {
                    const listaServicios = state.listaCarrito[key][payload.tipoServicio] || [];
                    let servicio = listaServicios.find((servicio) => servicio.idServicio === payload.servicio.idServicio);
                    if( servicio ) {
                        servicio.asientos.push(payload.asiento);
                    } else {
                        delete payload.servicio.logo;
                        listaServicios.push({
                            ...payload.servicio,
                            asientos: [payload.asiento]
                        });
                    }
                    state.listaCarrito[key][payload.tipoServicio] = listaServicios;
                    if( state.live_time ) {
                        encryptDataNoTime(state, LocalStorageEntities.car);
                    } else {
                        encryptData(state, LocalStorageEntities.car, Date.now() + (15 * 60 * 1000));
                    }
                }
            }
        },
        agregarPasajero: (state) => {

        },
        eliminarServicio: (state, action) => {
            debugger;
            const { payload } = action;
            let key = '';
            
            if( payload.tipoServicio === 'ida' ) { 
                key = `${payload.servicio.idTerminalOrigen}-${payload.servicio.idTerminalDestino}`;
            } else {
                key = `${payload.servicio.idTerminalDestino}-${payload.servicio.idTerminalOrigen}`;
            }

            if( state.listaCarrito[key] ) {
                if( state.listaCarrito[key][payload.tipoServicio] ) {
                    const previewService = state.listaCarrito[key][payload.tipoServicio].find((servicio) => servicio.idServicio === payload.servicio.idServicio);
                    const newAsientos = previewService.asientos.filter((asiento) => asiento.asiento !== payload.asiento.asiento);
                    if( newAsientos.length === 0 ) {
                        state.listaCarrito[key][payload.tipoServicio] = state.listaCarrito[key][payload.tipoServicio].filter((servicio) => servicio.idServicio !== payload.servicio.idServicio);
                        delete state.live_time;
                        encryptDataNoTime(state, LocalStorageEntities.car);
                    } else {
                        previewService.asientos = newAsientos;
                        const newArray = state.listaCarrito[key][payload.tipoServicio].filter((servicio) => servicio.idServicio !== payload.servicio.idServicio);
                        newArray.push(previewService)
                        state.listaCarrito[key][payload.tipoServicio] = newArray;
                        encryptDataNoTime(state, LocalStorageEntities.car); 
                    }
                }
            }
        }
    },
});

export const { agregarServicio, agregarPasajero, eliminarServicio } = compraSlice.actions;

export default compraSlice.reducer;