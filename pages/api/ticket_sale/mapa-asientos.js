import doLogin from '../../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

export default async (req, res) => {

    try {
       
        let token = await doLogin();
        let data = await axios.post(config.service_url + `/integracion/buscarPlantillaVertical`,{
                "idServicio": req.body.idServicio,
                "tipoBusPiso1":req.body.tipoBusPiso1,
                "tipoBusPiso2":req.body.tipoBusPiso2,
                "fechaServicio": req.body.fechaServicio,
                "idOrigen":req.body.idOrigen,
                "idDestino":req.body.idDestino,
                "integrador": req.body.integrador,
                "horaServicio": req.body.horaServicio,
                "clasePiso1": req.body.clasePiso1,
                "clasePiso2": req.body.clasePiso2,
                "empresa": req.body.empresa,
            },{
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
