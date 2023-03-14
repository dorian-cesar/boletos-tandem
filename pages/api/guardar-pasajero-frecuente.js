import doLogin from '../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

export default async (req, res) => {

    try {
        console.log(doLogin)
        let token = await doLogin();
        let data = await axios.post(config.service_url + `/usuario/guardarPasajeroFrecuente`,{
                "pullmanMas":"14191952-0",
                "tipoDocumento":"R",
                "documento":"18052080-5",
                "apellido":"BETANCOURT",
                "comunaDestino":"09121",
                "comunaOrigen":"13102",
                "email":"marcobetancourt@wit.la",
                "nacionalidad":"CHL",
                "nombre":"Marco"
            },{
        headers: {
            'Authorization': `Bearer ${token.token}`
        }
        })
        res.status(200).json(data.data);
    } catch(e){
        console.log(e)
        res.status(400).json(e)
    }
    
}   