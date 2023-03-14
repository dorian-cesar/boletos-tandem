import doLogin from '../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

export default async (req, res) => {

    try {
        console.log(doLogin)
        let token = await doLogin();
        console.log(req.query)
        let data = await axios.post(config.service_url + `/integracion/generarComprobante`,{codigo: req.query.codigo, boleto:req.query.boleto},{
        headers: {
            'Authorization': `Bearer ${token.token}`
        }
        })
        console.log(data.data)
        const decoded = Buffer.from(data.data.archivo, 'base64');

  
        res.writeHead(200, {    
            "Content-Disposition": "attachment;filename=" + data.data.nombre,
            'Content-Type': 'application/pdf',
            'Content-Length': decoded.length
        });
        res.end(decoded);
    } catch(e){
        console.log(e)
        res.status(400).json(e)
    }
    
}   