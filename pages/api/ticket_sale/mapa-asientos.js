import doLogin from "../../../utils/oauth-token";
import getConfig from "next/config";
import axios from "axios";
const { serverRuntimeConfig } = getConfig();
const config = serverRuntimeConfig;

import { authMiddleware } from "../auth-middleware";

import CryptoJS from "crypto-js";

// export default async (req, res) => {
//   try {
//     const { data } = JSON.parse(req.body);

//     const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;
//     const decrypted = CryptoJS.AES.decrypt(data, secret);
//     const serviceRequest = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

//     const serviceId = serviceRequest.idServicio
//     console.log("url:", config.url_api + `/services/${serviceId}/seats-detail`);

//     const serviceResponse = await axios.get(
//       config.url_api + `/services/${serviceId}/seats-detail`
//     );
//     console.log("serviceResponse:", serviceResponse.data);
//     res.status(200).json(serviceResponse.data);
//   } catch (e) {
//     res.status(400).json(e.response.data);
//   }
// };

export default async (req, res) => {
  try {
    const { data } = JSON.parse(req.body);

    const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;
    const decrypted = CryptoJS.AES.decrypt(data, secret);
    const serviceRequest = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

    const serviceId = serviceRequest.idServicio;
    // console.log("url:", config.url_api + `/services/${serviceId}/seats-detail`);

    const serviceResponse = await axios.get(
      config.url_api + `/services/${serviceId}/seats-detail`
    );

    function transformarAsientos(data) {
      const transformar = (seatsArray) => {
        return seatsArray.map((row) =>
          row
            .map(({ number, status, price, ...rest }) => ({
              ...rest,
              asiento: number,
              estado: status,
              // valorAsiento: price + 5000, // Se suma 5000 al valor del asiento para simular
              // valorAsiento: price,
              valorAsiento: 50,
            }))
            .reverse()
        );
      };
      const nuevaData = { ...data };
      if (nuevaData.seats.firstFloor) {
        nuevaData.seats.firstFloor = transformar(nuevaData.seats.firstFloor);
      }
      if (nuevaData.seats.secondFloor) {
        nuevaData.seats.secondFloor = transformar(nuevaData.seats.secondFloor);
      }
      return nuevaData;
    }
    const dataTransformada = transformarAsientos(serviceResponse.data);
    res.status(200).json(dataTransformada);
  } catch (e) {
    res.status(400).json(e.response.data);
  }
};
