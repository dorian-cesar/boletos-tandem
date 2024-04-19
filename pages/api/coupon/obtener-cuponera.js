import doLogin from '../../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"


const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

export default async (req, res) => {
    try {
        const codigo = Object.keys(req.body)[0];
        let token = await doLogin();
        let data = await axios.post(config.service_url + `/cuponera/obtenerDatosCompraCuponera`, {
            "idSistema": 7,
            "idIntegrador": 1000,
            "codigoTransaccion": codigo,
        }, {
            headers: {
                'Authorization': `Bearer ${token.token}`
            }
        });
 
        res.status(200).json(data.data);
    } catch(e){
        res.status(400).json(e.response.data)
    }
}
