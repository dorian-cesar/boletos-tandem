import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

export default async (req, res) => {
    try {
        const data = await axios.post(config.service_url + `/usuario/obtenerInformacionPasajero`,{
            documento: req.body.documento,
            tipodoc: req.body.tipodoc
        });

        let response = {}

        if( data.status && data.status >= 200 || data.status <= 299 ) {
            const { nombres, parterno, nacionalidad } = data.data;
            response = {
                nombres,
                apellidos: parterno,
                nacionalidad
            }
        }

        res.status(200).json(response);
    } catch(e){
        res.status(400).json(e.response.data)
    }
    
}   