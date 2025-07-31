// import doLogin from '../../../utils/oauth-token';
// import getConfig from 'next/config'
// import axios from "axios"
// const {serverRuntimeConfig, publicRuntimeConfig} = getConfig();
// const config = serverRuntimeConfig;
// import { WebpayPlus, Environment, Options } from 'transbank-sdk';

// import { authMiddleware } from '../auth-middleware';

// import CryptoJS from "crypto-js";

// async function handleGuardarMultiCarro(req, res) {

//     try {
//         let token = await doLogin();

//         const { data } = JSON.parse(req.body);

//         const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;
//         const decrypted = CryptoJS.AES.decrypt(data, secret);
//         const serviceRequest = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

//         const serviceResponse = await axios.post(config.service_url + `/integracion/guardarNuevaTransaccion`, serviceRequest ,{
//             headers: {
//                 'Authorization': `Bearer ${token.token}`
//             }
//         });

//         if(serviceResponse.data.status){

//             const { montoTotal } = serviceRequest;

//             if( montoTotal === 0 ) {
//                 let dataSentCerrar = {
//                     "codigo": serviceResponse.data.object.codigo,
//                     "codigotransbank": '0000',
//                     "numerocuota": '0',
//                     "numerotarjeta": 'WALLET',
//                     "tipocuota": 'WALLET'
//                 }

//                 const dataCerrar = await axios.post(config.service_url + `/integracion/terminarNuevaTransaccion`, dataSentCerrar, {
//                     headers: {
//                         'Authorization': `Bearer ${token.token}`
//                     }
//                 })

//                 res.status(200).json({ url: "/respuesta-transaccion/" + serviceResponse.data.object.codigo, token, inputName: "TBK_TOKEN" });
//             }

//             const commerceCode = process.env.TBK_API_KEY_ID;
//             const apiKey = process.env.TBK_API_KEY_SECRET;

//             let tx;

//             if(process.env.NODE_ENV_TBK !== "production"){
//                 WebpayPlus.configureForIntegration(commerceCode, apiKey)
//                 tx = new WebpayPlus.Transaction(new Options(commerceCode, apiKey, Environment.Integration))
//             } else {
//                 WebpayPlus.configureForProduction(commerceCode, apiKey);
//                 WebpayPlus.environment = Environment.Production;
//                 tx = new WebpayPlus.Transaction(new Options(commerceCode, apiKey, Environment.Production))

//             }

//             tx.create(
//                 serviceResponse.data.object.codigo,
//                 serviceResponse.data.object.codigo,
//                 montoTotal,
//                 publicRuntimeConfig.site_url + `/confirm-transaction?codigo=${ serviceResponse.data.object.codigo }`).then(async ({ url, token }) => {
//                 const response = { url, token, inputName: "TBK_TOKEN", codigo: serviceResponse.data.object.codigo }
//                 console.log('RESPONSE:::', response);
//                 res.status(200).json(response);

//               }).catch((e)=>{
//                   console.log(e);
//                   res.status(500).json(e.message)
//               })

//         } else {
//             res.status(200).json({error: {message:'Hubo un error'}});
//         }

//     } catch(e){
//         console.log(e.message)
//         res.status(400).json(response.data);
//     }

// }

// export default authMiddleware(handleGuardarMultiCarro);

import doLogin from "../../../utils/oauth-token";
import getConfig from "next/config";
import axios from "axios";
import { WebpayPlus, Environment, Options } from "transbank-sdk";
import crypto from "crypto";
import { stringify } from "querystring";
import CryptoJS from "crypto-js";
import { isPropertyAccessChain } from "typescript";
import { authMiddleware } from "../auth-middleware";

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
const config = serverRuntimeConfig;

async function handleGuardarMultiCarro(req, res) {
  try {
    // let token = await doLogin();
    // console.log("FLOW_API_KEY", process.env.FLOW_API_KEY);
    // console.log("FLOW_SECRET_KEY", process.env.FLOW_SECRET_KEY);
    // console.log("FLOW_API_URL", process.env.FLOW_API_URL);

    const { data } = JSON.parse(req.body);

    const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;
    const decrypted = CryptoJS.AES.decrypt(data, secret);
    const serviceRequest = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

    // console.log("serviceRequest:", serviceRequest)

    const apiKey = process.env.FLOW_API_KEY;
    // console.log("apiKey", apiKey);

    const isProd = process.env.NODE_ENV === "production";
    const urlReturn = isProd
    // ? "https://boletos-com.netlify.app/confirm-transaction"
      ? "https://boletos-tandem.netlify.app/api/v2/receive-transaction"
      // : `http://localhost:3000/confirm-transaction`;
      : `http://localhost:3000/api/v2/receive-transaction`;

    const params = {
      apiKey: apiKey,
      commerceOrder: crypto.randomUUID(),
      currency: "CLP",
      // paymentMethod: 9,
      timeout: 1800,
      urlConfirmation: "http://sandbox.dev-wit.com/api/paymentConfirmation/", // llamada POST api/endpoint
      urlReturn: urlReturn,
      email: serviceRequest.datosComprador.email,
      subject: "Compra de pasajes de bus",
      amount: serviceRequest.montoTotal,
    };

    const secretKey = process.env.FLOW_SECRET_KEY;

    const keys = Object.keys(params);
    keys.sort();
    let toSign = "";
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      toSign += key + params[key];
    }
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(toSign)
      .digest("hex");

    const body = {
      ...params,
      s: signature,
    };

    const encodedBody = stringify(body);
    const url = process.env.FLOW_API_URL;

    try {
      const response = await axios.post(`${url}/payment/create`, encodedBody, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      console.log(
        "checkout url",
        `${response.data.url}?token=${response.data.token}`
      );
      return res.status(200).json(response.data);
    } catch (error) {
      console.error("Error en llamada a Flow:", error.message);
      res.status(500).json({
        error: "Error al crear el pago en Flow",
        errorMessage: error.message,
        bodyReq: body,
      });
    }
  } catch (e) {
    console.log(e.message);
    res.status(400).json({ error: e.message });
  }
}

export default handleGuardarMultiCarro;
