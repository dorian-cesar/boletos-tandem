import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

async function endTransaction(token, codigo) {
    let carro;
    try {
        carro = await axios.post(config.site_url + "/api/carro", {
            token_ws: token, 
            codigo
        });
    } catch (error) {
        console.log('ERROR:::', error);
    }
    return carro;
}

export default async (req, res) => {
    try {
        const { codigo, token_ws } = req.body;

        const { data } = await endTransaction(token_ws, codigo);
        const { carro, cerrar, commit } = data;

        if( commit && commit.status === 'AUTHORIZED' ){
            res.status(200).json({ carro, cerrar, commit });
            // res.redirect('/respuesta-transaccion-v2');
        } else {
            res.status(400).json({ cerrar, transactionCode: codigo });
            // res.redirect('/error-transaccion');
        }
    } catch(error){
        console.error('ERROR:::', error);
        res.status(400).json({ error: "Error al procesar la solicitud" });
    }
    
}   