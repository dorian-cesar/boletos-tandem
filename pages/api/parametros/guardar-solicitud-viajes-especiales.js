import axios from "axios";
import doLogin from "../../../utils/oauth-token";
import getConfig from 'next/config';
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;


export default async (req, res) =>{

    try {
        debugger
        // let token = await doLogin();
        let data = await axios.post(config.service_url + `/parametros/guardarSolicitudViajesEspeciales`,req.body)
        console.log('Data...',data)
        res.status(200).json(data.data);
    } catch(e){
        console.log(e)

        res.status(400).json(e.response)
    }
}