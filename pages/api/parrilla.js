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

        res.status(200).json(serviceResponse.data);
    } catch(e){
        console.error(e);
        res.status(400).json(e.response.data)
    }
}

export default authMiddleware(handlerParrilla);