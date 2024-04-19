import doLogin from '../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

export default async (req, res) => {

    try {
       
        let token = await doLogin();
        let data = await axios.get(config.service_url + `/integracion/buscarCiudadPorCodigo/${req.body.id_ciudad}`,{
            headers: {
                'Authorization': `Bearer ${token.token}`,
                'Content-Type' : 'text/plain' 
            }
        })
        res.status(200).json(data.data);
    } catch(e){
        let response = {
            message: 'Error al obtener ciudades',
            status: false
        }
        res.status(400).json(response)
    }
    
}   