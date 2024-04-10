import doLogin from '../../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

export default async (req, res) => {
    try {
        const postData = req.body;
        console.log(postData);
        let token = await doLogin();
        let data = await axios.post(config.service_url + `/wallet/consultaSaldoWallet`, { mail: postData.mail }, {
            headers: {
                'Authorization': `Bearer ${token.token}`
            }
        })
        res.status(200).json(data.data);
    } catch(error){
        console.log(error?.response?.data)
        res.status(400).json(error?.response.data);
    }
    
}   