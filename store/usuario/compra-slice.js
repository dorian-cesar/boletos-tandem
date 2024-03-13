import { createSlice } from '@reduxjs/toolkit'
import LocalStorageEntities from 'entities/LocalStorageEntities';
import { decryptData, encryptData, encryptDataNoTime } from 'utils/encrypt-data';
import axios from "axios";

let initialState = {
    idSistema: 7,
    listaCarrito: {},
    informacionAgrupada: [],
    datosComprador: {},
    medioPago: ''
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
        },
        agruparInformacionPago: (state, action) => {
            const { payload } = action;
            state.informacionAgrupada = payload;
        },
        agregarInformacionAsiento: (state, action) => {
            debugger;
            const { payload } = action;
            state.informacionAgrupada = state.informacionAgrupada.map((servicio) => {
                debugger;
                if( servicio.idServicio === payload.servicio.idServicio ) {
                    servicio.asientos = servicio.asientos.map((asiento) => {
                        debugger;
                        if( asiento.asiento === payload.asiento.asiento ) {
                            asiento = payload.asiento;
                        }
                        return asiento;
                    });
                }
                return servicio;
            });
        },
        asignarDatosComprador: (state, action) => {
            const { payload } = action;
            state.datosComprador = payload;
        },
        agregarMedioPago: (state, action) => {
            const { payload } = action;
            state.medioPago = payload;
        },
        limpiarListaCarrito: (state, action) => {
            state.listaCarrito = {};
            state.informacionAgrupada = [];
            state.datosComprador = {};
            state.medioPago = '';
            state.live_time = null;
            localStorage.removeItem(LocalStorageEntities.car);
        },
        liberarAsientos: (state, action) => {
            Object.entries(state.listaCarrito).map(([key, value]) => {
                if(value.ida){
                    value.ida.forEach(servicioIda => {
                        servicioIda.asientos.forEach(async (elemento) =>{
                            let liberarAsiento = {
                                servicio: servicioIda?.idServicio,
                                codigoReserva: 1,
                                fecha: servicioIda?.fechaServicio,
                                origen: servicioIda?.idTerminalOrigen,
                                destino: servicioIda?.idTerminalDestino,
                                integrador: 1000,
                                asiento: elemento?.asiento,
                                tarifa: elemento?.tarifa,
                            }
                            try {
                                const { data } = await axios.post("/api/ticket_sale/liberar-asiento", liberarAsiento);
                              } catch (e) {}
                        })
                    })
                }
                if(value.vuelta) {
                    value.vuelta.forEach(servicioVuelta => {
                        servicioVuelta.asientos.forEach(async (elemento) =>{
                            let liberarAsiento = {
                                servicio: servicioVuelta?.idServicio,
                                codigoReserva: 1,
                                fecha: servicioVuelta?.fechaServicio,
                                origen: servicioVuelta?.idTerminalOrigen,
                                destino: servicioVuelta?.idTerminalDestino,
                                integrador: 1000,
                                asiento: elemento?.asiento,
                                tarifa: elemento?.tarifa,
                            }
                            try {
                                const { data } = await axios.post("/api/ticket_sale/liberar-asiento", liberarAsiento);
                              } catch (e) {}
                        })
                    })
                }
                state.listaCarrito = {};
                state.informacionAgrupada = [];
                state.datosComprador = {};
                state.medioPago = '';
                state.live_time = null;
                localStorage.removeItem(LocalStorageEntities.car);
            })
        }
    },
});

export const { 
    agregarServicio, 
    eliminarServicio, 
    agruparInformacionPago, 
    agregarInformacionAsiento, 
    asignarDatosComprador, 
    agregarMedioPago,
    limpiarListaCarrito,
    liberarAsientos
} = compraSlice.actions;

export default compraSlice.reducer;