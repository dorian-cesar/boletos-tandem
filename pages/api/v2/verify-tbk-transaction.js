import doLogin from '../../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

async function endTransaction(token, codigo) {
    let carro;
    try {
        carro = await axios.post(config.site_url + "/api/carro", {
            token_ws: token, codigo
        });
    } catch (error) {
        console.log('ERROR:::', error);
    }
    return carro;
}

export default async (req, res) => {
    try {
        const { codigo, token_ws } = req.query;

        const { carro, cerrar, commit } = await endTransaction(token_ws, codigo);

        console.log('CARRO:::', carro.data);

        // TODO: condicionar a que ventana debe ir segun el estado de la transaccion
        if( commit && commit.status == 'AUTHORIZED' ){
        }

        // const postData = req.body;
        // let bearerToken = await doLogin();

        // let data = await axios.post(config.service_url + `/integracion/anularVenta`, postData,{
        // headers: {
        //     'Authorization': `Bearer ${bearerToken.token}`
        // }
        // });

        res.status(200).json(data.data);
    } catch(error){
        console.log(error);
        res.status(400).json(error.response.data);
    }
    
}   