import getConfig from "next/config";
import axios from "axios";
const { serverRuntimeConfig } = getConfig();
const config = serverRuntimeConfig;

// export default async (req, res) => {

//     try {
//         console.log(doLogin)
//         let token = await doLogin();
//         let data = await axios.get(config.service_url + `/integracion/buscaCiudades`,{
//         headers: {
//             'Authorization': `Bearer ${token.token}`
//         }
//         })
//         res.status(200).json(data.data);
//     } catch(e){
//         res.status(400).json(e.response.data)
//     }
// }

export default async (req, res) => {
  try {
    const response = await axios.get(config.url_api + `/routes/origins`);
    res.status(200).json(response.data);
  } catch (e) {
    res.status(400).json(e.response.data);
  }
};
