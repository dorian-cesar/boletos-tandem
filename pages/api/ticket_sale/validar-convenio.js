import doLogin from '../../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

export default async (req, res) => {

    try {
        let dataSent = {"idConvenio":req.body.convenio,
        "listaAtributo":Object.keys(req.body.fields).map((i)=>{ return {"idCampo":i,"valor":req.body.fields[i]}}),
        "listaBoleto":req.body.pasajes
    }
        console.log(dataSent)
        let token = await doLogin();
        let data = await axios.post(config.service_url + `/convenio/validartDescuentoConvenio`,dataSent,{
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