import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

export default async (req, res) => {
    try {
        const { servicio } = req.body;
        let data = await axios.post(config.service_url + `/integracion/obtenerItinerario`, {
            servicio,
            'integrador': 1000
        })
        res.status(200).json(data.data);
    } catch(e){
        res.status(400).json(e.response.data)
    }
    
}   