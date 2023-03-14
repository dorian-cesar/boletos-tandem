import doLogin from '../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

export default async (req, res) => {

    try {
       
        let token = await doLogin();
        const sendData = {
                "boleto":req.body.boleto,
                "idSistema": 1
            }
        let data = await axios.post(config.service_url + `/operacion/validarBoletoCambio`,sendData,{
            headers: {
                'Authorization': `Bearer ${token.token}`
            }
        })
        console.log(data.data)
        if(data.data.resultado.exito){
            res.status(200).json(data.data.boleto);
        } else {
            res.status(200).json({valido: false, error: data.data.resultado.mensaje});
        }
       
    } catch(e){
        console.log(e)
        res.status(400).json(e)
    }
    
}   