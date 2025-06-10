import doLogin from '../../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"

import { authMiddleware } from '../auth-middleware';

import CryptoJS from "crypto-js";

const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

// async function handleTomarAsiento(req, res) {
//     try {
//         const { data } = JSON.parse(req.body);

//         const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;
//         const decrypted = CryptoJS.AES.decrypt(data, secret);
//         const serviceRequest = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
       
//         let token = await doLogin();
//         let postData = {
//             "servicio": serviceRequest.servicio,
//             "fecha": serviceRequest.fecha,
//             "origen": serviceRequest.origen,
//             "destino": serviceRequest.destino,
//             "integrador": serviceRequest.integrador,
//             "asiento": serviceRequest.asiento,
//             "tarifa": serviceRequest.tarifa
//         }

//         const serviceResponse = await axios.post(config.service_url + `/integracion/tomarAsiento`,
//             postData,{
//             headers: {
//                 'Authorization': `Bearer ${token.token}`
//             }
//         })
//         res.status(200).json(serviceResponse.data);
//     } catch(e){
//         console.log(e);
//         res.status(400).json(e.response.data)
//     }
// }   

async function handleTomarAsiento(req, res) {
    try {
        const { data } = JSON.parse(req.body);

        const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;
        const decrypted = CryptoJS.AES.decrypt(data, secret);
        const serviceRequest = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
        const serviceId = serviceRequest.servicio;
       
        let token = await doLogin();
        let postData = {
            // "servicio": serviceRequest.servicio,
            // "fecha": serviceRequest.fecha,
            // "origen": serviceRequest.origen,
            // "destino": serviceRequest.destino,
            // "integrador": serviceRequest.integrador,
            // "tarifa": serviceRequest.tarifa
            "seatNumber": serviceRequest.asiento,
            "userId": serviceRequest.integrador,
        }

        const serviceResponse = await axios.post(config.service_url + `/seats/${serviceId}/reserve`,
            postData,{
            headers: {
                'Authorization': `Bearer ${token.token}`
            }
        })
        res.status(200).json(serviceResponse.data);
    } catch(e){
        console.log(e);
        res.status(400).json(e.response.data)
    }
}

export default authMiddleware(handleTomarAsiento);