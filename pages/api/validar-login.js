import doLogin from '../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

export default async (req, res) => {
    try {
        const postData = req.body;
        //let token = await doLogin();
        let data = await axios.post(config.service_url + `/usuarioPortal/validarLogin`, postData)
        res.status(200).json(data.data);
    } catch(error){
        res.status(400).json(error.response.data);
    }
    
}   