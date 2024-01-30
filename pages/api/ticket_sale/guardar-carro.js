import doLogin from '../../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
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
            let commerceCode = 597035840877;
            let apiKey = '4c69649914993ff286f7888fb7f4366c';
            let tx;
            console.log(process.env.NODE_ENV)
            if(process.env.NODE_ENV_TBK !== "production"){
               
                WebpayPlus.configureForIntegration("597055555532",'579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C')
                tx = new WebpayPlus.Transaction(new Options("597055555532", '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C', Environment.Integration))
            } else {
                WebpayPlus.configureForProduction(commerceCode, apiKey);
                WebpayPlus.environment = Environment.Production;     
                
            }
           
            tx.create(
                data.object.codigo,
                data.object.codigo,
                req.body.montoTotal,
                serverRuntimeConfig.site_url + "/respuesta-transaccion/"+ data.object.codigo).then(async ({ url, token }) => {
                
             
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