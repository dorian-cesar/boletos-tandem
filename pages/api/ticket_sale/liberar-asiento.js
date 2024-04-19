import doLogin from '../../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

export default async (req, res) => {

    try {
       
        let token = await doLogin();
        let data = await axios.post(config.service_url + `/integracion/liberarAsiento`, {"servicio":req.body.servicio,
        "fecha":req.body.fecha,
        "origen":req.body.origen,
        "destino":req.body.destino,
        "integrador":req.body.integrador,
        "asiento":req.body.asiento,
        "tarifa":req.body.tarifa,
         "codigoReserva": req.body.codigoReserva},{
            headers: {
                'Authorization': `Bearer ${token.token}`
            }
        })
        res.status(200).json(data.data);
    } catch(e){
        res.status(400).json(e.response.data)
    }
    
}   