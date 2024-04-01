import doLogin from '../../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

export default async (req, res) => {

    try {
        const { boleto } = req.body;
        let token = await doLogin();
        let { data } = await axios.post(config.service_url + `/operacion/validarBoletoCambio`, { boleto, idSistema: 1 },{
            headers: {
                'Authorization': `Bearer ${token.token}`
            }
        })

        res.status(200).json(data.object.boleto);
    } catch({ response }){
        res.status(400).json(response.data)
    }
    
}   