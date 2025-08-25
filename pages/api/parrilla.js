import getConfig from "next/config";
import axios from "axios";
const { serverRuntimeConfig } = getConfig();
const config = serverRuntimeConfig;

import CryptoJS from "crypto-js";

export default async (req, res) => {
  try {
    const { data } = JSON.parse(req.body);

    const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;
    const decrypted = CryptoJS.AES.decrypt(data, secret);
    const serviceRequest = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

    const { origen, destino, startDate } = serviceRequest;

    // console.log("Request to service:", {
    //   origen,
    //   destino,
    //   startDate,
    // });

    const serviceResponse = await axios.get(
      config.url_api +
        `/route-blocks-generated/search?from=${origen}&to=${destino}&date=${startDate}`
    );
    console.log(serviceResponse.data);
    res.status(200).json(serviceResponse.data);
  } catch (e) {
    console.error(e);
    res.status(400).json(e.response.data);
  }
};