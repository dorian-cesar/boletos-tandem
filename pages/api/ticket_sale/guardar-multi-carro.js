import doLogin from '../../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig, publicRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;
import { WebpayPlus, Environment, Options } from 'transbank-sdk';

import CryptoJS from "crypto-js";

export default async (req, res) => {

    try {
        let token = await doLogin();

        const { data } = req.body;

        const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;
        const decrypted = CryptoJS.AES.decrypt(data, secret);
        const serviceRequest = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

        const serviceResponse = await axios.post(config.service_url + `/integracion/guardarNuevaTransaccion`, serviceRequest ,{
            headers: {
                'Authorization': `Bearer ${token.token}`
            }
        })
        
        if(serviceResponse.data.status){

            const { montoTotal } = serviceRequest;

            if( montoTotal === 0 ) {
                let dataSentCerrar = {
                    "codigo": serviceResponse.data.object.codigo,
                    "codigotransbank": '0000',
                    "numerocuota": '0',
                    "numerotarjeta": 'WALLET',
                    "tipocuota": 'WALLET'
                }

                const dataCerrar = await axios.post(config.service_url + `/integracion/terminarNuevaTransaccion`, dataSentCerrar, {
                    headers: {
                        'Authorization': `Bearer ${token.token}`
                    }
                })

                res.status(200).json({ url: "/respuesta-transaccion/" + serviceResponse.data.object.codigo, token, inputName: "TBK_TOKEN" });
            }

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
                serviceResponse.data.object.codigo,
                serviceResponse.data.object.codigo,
                montoTotal,
                publicRuntimeConfig.site_url + "/respuesta-transaccion/"+ serviceResponse.data.object.codigo).then(async ({ url, token }) => {
                
                console.log('CODIGO:::', serviceResponse.data.object.codigo)
                console.log({url, token, inputName: "TBK_TOKEN"})
                res.status(200).json({ url, token, inputName: "TBK_TOKEN" });
              
              }).catch((e)=>{
                  console.log(e);
                  res.status(500).json(e.message)
              })

        } else {
            res.status(200).json({error: {message:'Hubo un error'}});
        }
      
    } catch(e){
        console.log(e.message)
        res.status(400).json(response.data);
    }
    
}   