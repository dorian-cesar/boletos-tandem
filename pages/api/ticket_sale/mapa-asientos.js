import doLogin from '../../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

import { authMiddleware } from '../auth-middleware';

import CryptoJS from "crypto-js";

async function handleMapaAsientos(req, res) {
    try {
        let token = await doLogin();

        const { data } = JSON.parse(req.body);

        const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;
        const decrypted = CryptoJS.AES.decrypt(data, secret);
        const serviceRequest = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

        const serviceResponse = await axios.post(config.service_url + `/integracion/buscarPlantillaVertical`,{
            "idServicio": serviceRequest.idServicio,
            "tipoBusPiso1": serviceRequest.tipoBusPiso1,
            "tipoBusPiso2": serviceRequest.tipoBusPiso2,
            "fechaServicio": serviceRequest.fechaServicio,
            "idOrigen": serviceRequest.idOrigen,
            "idDestino": serviceRequest.idDestino,
            "integrador": serviceRequest.integrador,
            "horaServicio": serviceRequest.horaServicio,
            "clasePiso1": serviceRequest.clasePiso1,
            "clasePiso2": serviceRequest.clasePiso2,
            "empresa": serviceRequest.empresa,
        },{
            headers: {
                'Authorization': `Bearer ${token.token}`
            }
        });

        const asientosSimulados = [
            {
                "idAsiento": 1,
                "numeroAsiento": "1A",
                "estado": "Disponible",
                "piso": 1
            },
            {
                "idAsiento": 2,
                "numeroAsiento": "1B",
                "estado": "Ocupado",
                "piso": 1
            },
            {
                "idAsiento": 3,
                "numeroAsiento": "1C",
                "estado": "Disponible",
                "piso": 1
            },
            {
                "idAsiento": 4,
                "numeroAsiento": "1D",
                "estado": "Ocupado",
                "piso": 1
            }
        ];

        res.status(200).json(serviceResponse.data);
        // res.status(200).json(asientosSimulados);
    } catch(e){
        res.status(400).json(e.response.data)
    }
}   

export default authMiddleware(handleMapaAsientos);