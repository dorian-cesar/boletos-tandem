import getConfig from 'next/config'
import axios from 'axios';

const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

export default async (req, res) => {
    try {
        const data = await axios.post(config.service_url + `/cuponera/recuperarCuponera`, JSON.parse(req.body));
        res.status(200).json(data.data);
    } catch(e){
        console.error(e);
        res.status(400).json(e.response.data)
    }
}