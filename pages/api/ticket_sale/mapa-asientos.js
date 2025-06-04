import doLogin from "../../../utils/oauth-token";
import getConfig from "next/config";
import axios from "axios";
const { serverRuntimeConfig } = getConfig();
const config = serverRuntimeConfig;

import { authMiddleware } from "../auth-middleware";

import CryptoJS from "crypto-js";

async function handleMapaAsientos(req, res) {
  try {
    let token = await doLogin();

    const { data } = JSON.parse(req.body);

    const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;
    const decrypted = CryptoJS.AES.decrypt(data, secret);
    const serviceRequest = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

    const serviceResponse = await axios.post(
      config.service_url + `/integracion/buscarPlantillaVertical`,
      {
        idServicio: serviceRequest.idServicio,
        tipoBusPiso1: serviceRequest.tipoBusPiso1,
        tipoBusPiso2: serviceRequest.tipoBusPiso2,
        fechaServicio: serviceRequest.fechaServicio,
        idOrigen: serviceRequest.idOrigen,
        idDestino: serviceRequest.idDestino,
        integrador: serviceRequest.integrador,
        horaServicio: serviceRequest.horaServicio,
        clasePiso1: serviceRequest.clasePiso1,
        clasePiso2: serviceRequest.clasePiso2,
        empresa: serviceRequest.empresa,
      },
      {
        headers: {
          Authorization: `Bearer ${token.token}`,
        },
      }
    );

    const asientosSimulados = {
      asientos1: [
        // Fila 1 (ejemplo: 2 asientos por fila)
        [
          { asiento: "A1", estado: "disponible" },
          { asiento: "A2", estado: "reservado" },
        ],
        // Fila 2 (asiento "B1" es un espacio vacío)
        [
          { asiento: "B1", estado: "sinasiento" },
          { asiento: "B2", estado: "disponible" },
        ],
        // Fila 3
        [
          { asiento: "C1", estado: "disponible" },
          { asiento: "C2", estado: "disponible" },
        ],
        // Fila 4 (asiento seleccionado por el usuario)
        [
          { asiento: "D1", estado: "seleccionado" },
          { asiento: "D2", estado: "reservado" },
        ],
      ],
      asientos2: [
        // Piso 2 (ejemplo: 3 asientos por fila)
        [
          { asiento: "E1", estado: "disponible" },
          { asiento: "E2", estado: "disponible" },
          { asiento: "E3", estado: "reservado" },
        ],
        [
          { asiento: "F1", estado: "sinasiento" },
          { asiento: "F2", estado: "seleccionado" },
          { asiento: "F3", estado: "disponible" },
        ],
        [
          { asiento: "G1", estado: "reservado" },
          { asiento: "G2", estado: "reservado" },
          { asiento: "G3", estado: "disponible" },
        ],
      ],
      k: "bus-001", // Identificador del bus (usado en funciones como `asientoClass`)
    };

    res.status(200).json(serviceResponse.data);
    // res.status(200).json(asientosSimulados);
  } catch (e) {
    res.status(400).json(e.response.data);
  }
}

export default authMiddleware(handleMapaAsientos);
