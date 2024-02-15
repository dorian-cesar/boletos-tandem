import doLogin from '../../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

export default async (req, res) => {

    try {
       
        let token = await doLogin();
        let data = await axios.post(config.service_url + `/cuponera/obtenerCuponerasActivas`, {
        }, {
            headers: {
                'Authorization': `Bearer ${token.token}`
            }
        });
        res.status(200).json(data.data);
    } catch(e){
        console.log(e)
        res.status(400).json(e)
    }
    
}   