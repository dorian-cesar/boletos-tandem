import doLogin from '../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;
const WebpayPlus = require('transbank-sdk').WebpayPlus;
const Environment = require('transbank-sdk').Environment;
const Options = require('transbank-sdk').Options;

export default async (req, res) => {

    try {
       
        let token = await doLogin();
        
        const commerceCode = process.env.TBK_API_KEY_ID;
        const apiKey = process.env.TBK_API_KEY_SECRET;

        let tx;

        if(process.env.NODE_ENV_TBK !== "production"){
            WebpayPlus.configureForIntegration(commerceCode, apiKey)
            tx = new WebpayPlus.Transaction(new Options(commerceCode, apiKey, Environment.Integration))
        } else {
            WebpayPlus.configureForProduction(commerceCode, apiKey);
            WebpayPlus.environment = Environment.Production;
            tx = new WebpayPlus.Transaction(new Options(commerceCode, apiKey, Environment.Production))     
            
        }

        let commit;

        let dataCerrar;

        try {
            commit = await tx.commit(req.body.token_ws  || '');
    
            console.log('COMMIT::::', commit);
    
            if(commit.status == 'AUTHORIZED'){
                let dataSentCerrar = {
                        "codigo":req.body.codigo,
                        "codigotransbank":commit.authorization_code,
                        "numerocuota":commit.installments_number,
                        "numerotarjeta":commit.card_detail.card_number,
                        "tipocuota":commit.payment_type_code
                    }
                console.log(dataSentCerrar)
                dataCerrar = await axios.post(config.service_url + `/integracion/terminarTransaccion`,dataSentCerrar,{
                    headers: {
                        'Authorization': `Bearer ${token.token}`
                    }
                })
            }
        } catch (error) {
            console.log('Transbank no encontro token');
        }

        let data = await axios.post(config.service_url + `/integracion/obtenerTransaccion`,{
            "codigo": req.body.codigo
            },{
            headers: {
                'Authorization': `Bearer ${token.token}`
            }
        });

        if( data.data.estado !== 'ACTI' ) {
            throw new Error();
        }
       
        if( dataCerrar && dataCerrar.data ) {
            res.status(200).json({ carro: data.data, cerrar: dataCerrar.data || null, commit: commit });
        } else {
            res.status(200).json({ carro: data.data, commit: commit });
        }
    } catch(e){
        console.log('ERROR TRANSACCION:::', e);
        res.status(400).json(e.response.data)
    }
    
}   