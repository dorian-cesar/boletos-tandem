import { createSlice } from '@reduxjs/toolkit'
import LocalStorageEntities from 'entities/LocalStorageEntities';
import { decryptData, encryptData, encryptDataNoTime } from 'utils/encrypt-data';
import axios from "axios";

let initialState = {
    idSistema: 7,
    listaCarrito: {},
    informacionAgrupada: [],
    datosComprador: {},
    medioPago: '',
    archivo: {},
    resultado: {},
    voucher: {},
}

if (typeof window !== 'undefined') {
    if ( localStorage.getItem(LocalStorageEntities.car) ) {
        let data = decryptData(LocalStorageEntities.car);
        if( data ) {
            initialState = data;
        } 
    }
}

const STAGES = {
    STAGE_IDA: 0,
    STAGE_VUELTA: 1
}

export const compraSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        agregarServicio: (state, action) => {
            const { payload } = action;
            let key = '';
            
            key = `${payload.servicio.idTerminalOrigen}-${payload.servicio.idTerminalDestino}`;
            // if( payload.tipoServicio === 'ida' ) { 
            // } else {
            //     key = `${payload.servicio.idTerminalDestino}-${payload.servicio.idTerminalOrigen}`;
            // }

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
                let listaServicios = [];
                if (state.listaCarrito.hasOwnProperty(key) && state.listaCarrito[key].hasOwnProperty(payload.tipoServicio)) {
                    listaServicios = state.listaCarrito[key][payload.tipoServicio];
                }

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

                // Verificar si la clave `key` existe en state.listaCarrito
                if (!state.listaCarrito.hasOwnProperty(key)) {
                    // Si no existe, crear un nuevo objeto vacío para esa clave
                    state.listaCarrito[key] = {};
                }

                // Asignar el valor a la clave `payload.tipoServicio`
                state.listaCarrito[key][payload.tipoServicio] = listaServicios;

                if( state.live_time ) {
                    encryptDataNoTime(state, LocalStorageEntities.car);
                } else {
                    encryptData(state, LocalStorageEntities.car, Date.now() + (15 * 60 * 1000));
                }
            }
        },
        eliminarServicio: (state, action) => {
            const { payload } = action;
            let key = '';
            
            key = `${payload.servicio.idTerminalOrigen}-${payload.servicio.idTerminalDestino}`;
            // if( payload.tipoServicio === 'ida' ) { 
            // } else {
            //     key = `${payload.servicio.idTerminalDestino}-${payload.servicio.idTerminalOrigen}`;
            // }

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
            const { payload } = action;
            state.informacionAgrupada = state.informacionAgrupada.map((servicio) => {
                if( servicio.idServicio === payload.servicio.idServicio ) {
                    servicio.asientos = servicio.asientos.map((asiento) => {
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
            const { medioPago } = action.payload;
            state.medioPago = medioPago;
        },
        limpiarListaCarrito: (state, action) => {
            state.listaCarrito = {};
            state.informacionAgrupada = [];
            state.datosComprador = {};
            state.medioPago = '';
            state.live_time = null;
        },
        limpiarListaCarritoCambioFecha: (state, action) => {
            const { stage } = action.payload;
            if( state.listaCarrito ) {
                const parOrigenDestino = Object.entries(state.listaCarrito);

                parOrigenDestino.map(([keyParOrigenDestino, value]) => {
                    let servicio;
                    if( stage === STAGES.STAGE_IDA ) {
                        servicio = value?.ida;
                    } else if( stage === STAGES.STAGE_VUELTA ) {
                        servicio = value?.vuelta;
                    }

                    if( servicio ) {
                        servicio.forEach((servicioSeleccionado) => {
                            servicioSeleccionado.asientos.forEach(async ( element ) => {
                                let liberarAsiento = {
                                    servicio: servicioSeleccionado?.idServicio,
                                    codigoReserva: 1,
                                    fecha: servicioSeleccionado?.fechaServicio,
                                    origen: servicioSeleccionado?.idTerminalOrigen,
                                    destino: servicioSeleccionado?.idTerminalDestino,
                                    integrador: 1000,
                                    asiento: element?.asiento,
                                    tarifa: element?.tarifa,
                                }
                                try {
                                    const { data } = await axios.post("/api/ticket_sale/liberar-asiento", liberarAsiento);
                                } catch (e) {}
                            });
                        });

                        try {
                            if( stage === STAGES.STAGE_IDA ) {
                                delete state.listaCarrito[keyParOrigenDestino]?.ida;
                            } else if( stage === STAGES.STAGE_VUELTA ) {
                                delete state.listaCarrito[keyParOrigenDestino]?.vuelta;
                            }
                        } catch (error) {
                            console.error("Servicio no encontrado", error);
                        }
                    }
                });

            }
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
        },
        agregarOrigenDestino: (state, action) => {
            state.origen = action.payload.origen;
            state.destino = action.payload.destino;
        },
        agregarCompraCuponera: (state, action) => {
            const { archivo, resultado, voucher } = action.payload;
            state.archivo = archivo;
            state.resultado = resultado;
            state.voucher = voucher;
        },
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
    liberarAsientos,
    agregarOrigenDestino,
    agregarCompraCuponera,
    limpiarListaCarritoCambioFecha
} = compraSlice.actions;

export default compraSlice.reducer;