import doLogin from '../../../utils/oauth-token';
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
        
        let commit = await tx.commit(req.body.token_ws || '');
        console.log('COMMIT::::', commit);
        let dataCerrar;
        if(commit.status == 'AUTHORIZED'){
            let dataSentCerrar = {
                    "codigo":req.body.codigo,
                    "codigotransbank":commit.authorization_code,
                    "numerocuota":commit.installments_number,
                    "numerotarjeta":commit.card_detail.card_number,
                    "tipocuota":commit.payment_type_code
                }
            console.log(dataSentCerrar)
            dataCerrar = await axios.post(config.service_url + `/cuponera/terminarTransaccionCuponeraFenix`,dataSentCerrar,{
                headers: {
                    'Authorization': `Bearer ${token.token}`
                }
            })
        }

        let data = await axios.post(config.service_url + `/integracion/obtenerTransaccion`,{
            "codigo": req.body.codigo
            },{
            headers: {
                'Authorization': `Bearer ${token.token}`
            }
        })
        console.log(commit, data.data, dataCerrar.data)
        res.status(200).json({carro: data.data, cerrar:dataCerrar.data, commit: commit});
    } catch(e){
        res.status(400).json(e.response.data)
    }
    
}   