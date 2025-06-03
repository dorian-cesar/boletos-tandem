import doLogin from '../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

import { authMiddleware } from './auth-middleware';

import CryptoJS from "crypto-js";

async function handlerParrilla(req, res) {
    try {
        let token = await doLogin();

        const { data } = JSON.parse(req.body);

        const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;
        const decrypted = CryptoJS.AES.decrypt(data, secret);
        const serviceRequest = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
        
        const serviceResponse = await axios.post(config.service_url + `/integracion/obtenerServicio`, {
            "origen": serviceRequest.origen,
            "destino": serviceRequest.destino,
            "fecha": serviceRequest.startDate,
            "hora": "0000",
            "idSistema": 1
        }, {
            headers: {
                'Authorization': `Bearer ${token.token}`
            }
        });

        //simulacion response parrilla
        const simulatedData = [
                    {
                        "origen": serviceRequest.origen,
                        "destino": serviceRequest.destino,
                        "fecha": serviceRequest.startDate,
                        "fechaLlegada": "2025-10-01",
                        "horaLlegada": "09:00",
                        "fechaSalida": serviceRequest.startDate,
                        "horaSalida": "08:00",
                        "thisParrilla": {
                            "idTerminalOrigen": 1,
                            "idTerminalDestino": 2,
                            "idServicio": 12345,
                            "fechaServicio": serviceRequest.startDate,
                            "idClaseBusPisoUno": 1,
                            "idClaseBusPisoDos": 2,
                            "asientos1": [
                                {"idAsiento": 1, "numeroAsiento": "1A", "estado": "Disponible"},
                                {"idAsiento": 2, "numeroAsiento": "1B", "estado": "Disponible"},
                                {"idAsiento": 3, "numeroAsiento": "1C", "estado": "Ocupado"},
                                {"idAsiento": 4, "numeroAsiento": "1D", "estado": "Disponible"}
                            ],
                            "asientos2": [
                                {"idAsiento": 5, "numeroAsiento": "2A", "estado": "Disponible"},
                                {"idAsiento": 6, "numeroAsiento": "2B", "estado": "Ocupado"},
                                {"idAsiento": 7, "numeroAsiento": "2C", "estado": "Disponible"},
                                {"idAsiento": 8, "numeroAsiento": "2D", "estado": "Disponible"}
                            ]
                        },
                        "clase": "Económica",
                        "precio": 15000
                    },
                    {
                        "origen": serviceRequest.origen,
                        "destino": serviceRequest.destino,
                        "fecha": serviceRequest.startDate,
                        "fechaLlegada": "2025-10-01",
                        "horaLlegada": "10:00",
                        "fechaSalida": serviceRequest.startDate,
                        "horaSalida": "08:00",
                        "thisParrilla": {
                            "idTerminalOrigen": 1,
                            "idTerminalDestino": 2,
                            "idServicio": 12346,
                            "fechaServicio": serviceRequest.startDate,
                            "idClaseBusPisoUno": 1,
                            "idClaseBusPisoDos": 2,
                            "asientos1": [
                                {"idAsiento": 9, "numeroAsiento": "1A", "estado": "Disponible"},
                                {"idAsiento": 10, "numeroAsiento": "1B", "estado": "Ocupado"},
                                {"idAsiento": 11, "numeroAsiento": "1C", "estado": "Disponible"},
                                {"idAsiento": 12, "numeroAsiento": "1D", "estado": "Disponible"}
                            ],
                            "asientos2": [
                                {"idAsiento": 13, "numeroAsiento": "2A", "estado": "Disponible"},
                                {"idAsiento": 14, "numeroAsiento": "2B", "estado": "Ocupado"},
                                {"idAsiento": 15, "numeroAsiento": "2C", "estado": "Disponible"},
                                {"idAsiento": 16, "numeroAsiento": "2D", "estado": "Disponible"}
                            ]
                        },
                        "clase": "Premium",
                        "precio": 20000
                    }
                ]

        // res.status(200).json(serviceResponse.data);
        res.status(200).json(simulatedData);

    } catch(e){
        console.error(e);
        res.status(400).json(e.response.data)
    }
}

export default authMiddleware(handlerParrilla);