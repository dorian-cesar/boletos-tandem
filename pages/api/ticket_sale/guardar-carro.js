import doLogin from '../../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig, publicRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;
import { WebpayPlus, Environment, Options } from 'transbank-sdk';

export default async (req, res) => {

    try {
        let token = await doLogin();
        let { data } = await axios.post(config.service_url + `/integracion/guardarTransaccion`,req.body,{
            headers: {
                'Authorization': `Bearer ${token.token}`
            }
        })
        if(data.status){
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
           
            tx.create(
                data.object.codigo,
                data.object.codigo,
                req.body.montoTotal,
                publicRuntimeConfig.site_url + "/respuesta-transaccion/"+ data.object.codigo).then(async ({ url, token }) => {
                
             
                console.log({url, token, inputName: "TBK_TOKEN"})
                res.status(200).json({ url, token, inputName: "TBK_TOKEN" });
              
              }).catch((e)=>{
                  console.log(e);
                  res.status(500).json(e.message)
              })

        } else {
            res.status(200).json({error: {message:'Hubo un error'}});
        }
      
    } catch({ response }){
        res.status(400).json(response.data);
    }
    
}   