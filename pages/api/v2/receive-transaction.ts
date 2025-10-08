// import type { NextApiRequest, NextApiResponse } from "next";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }

//   try {
//     // Flow envía los datos por x-www-form-urlencoded, no JSON
//     // Next.js no lo parsea automáticamente en este formato
//     // Necesitas usar un middleware o manejarlo manualmente

//     // Si estás usando bodyParser por defecto, necesitas desactivarlo para esta ruta y usar algo como 'raw-body'
//     console.log("Respuesta de Flow:", res);

//     res.setHeader("Content-Type", "text/html");
//     res.status(200).send(`
//       <html>
//         <head>
//           <meta http-equiv="refresh" content="0; url=/confirm-transaction" />
//         </head>
//         <body>
//           Cargando...
//         </body>
//       </html>
//     `);
//   } catch (error) {
//     console.error("Error procesando retorno de Flow:", error);
//     res.status(500).json({ message: "Error interno" });
//   }
// }

import { WebpayPlus, Environment, Options } from "transbank-sdk";
import CryptoJS from "crypto-js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const token = req.query.token_ws;
    console.log("token res:", token);
    const data = req.query;

    if (!token) {
      console.error("No se recibió token_ws de Transbank");
      console.log("data res:", data);
      return res.writeHead(302, { Location: "/confirm-transaction" }).end();
    }

    // Crear instancia de WebpayPlus
    const tx = new WebpayPlus.Transaction(
      new Options(
        process.env.TBK_COMMERCE_CODE,
        process.env.TBK_API_KEY_SECRET,
        Environment.Integration // develop
        // Environment.Production
      )
    );

    // Confirmar la transacción
    const response = await tx.commit(token);
    console.log("Webpay commit response:", response);

    // --- ENCRIPTAR DATA ---
    const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;
    const dataToEncrypt = {
      status: response.status,
      amount: response.amount,
      buyOrder: response.buy_order,
    };
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(dataToEncrypt),
      secret
    ).toString();

    // Redirigir al usuario con el query param encriptado
    const redirectUrl = `/confirm-transaction?data=${encodeURIComponent(
      encryptedData
    )}`;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <html>
        <head>
          <meta http-equiv="refresh" content="0; url=${redirectUrl}" />
        </head>
        <body>
          Redirigiendo...
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error al confirmar transacción Webpay:", error);
    res.status(500).send("Error interno al procesar el pago");
  }
}

// import { WebpayPlus, Environment, Options } from "transbank-sdk";

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }

//   try {
//     const { token_ws } = req.body;

//     if (!token_ws) {
//       console.error("No se recibió token_ws");
//       return res.status(400).json({ message: "Token no recibido" });
//     }

//     // Crear instancia de WebpayPlus
//     const tx = new WebpayPlus.Transaction(
//       new Options(
//         process.env.TBK_COMMERCE_CODE,
//         process.env.TBK_API_KEY_SECRET,
//         process.env.NODE_ENV === "production"
//           ? Environment.Production
//           : Environment.Integration
//       )
//     );

//     // Confirmar la transacción con Transbank
//     const response = await tx.commit(token_ws);
//     console.log("Webpay commit response:", response);

//     // Retornar el resultado al frontend
//     return res.status(200).json({
//       status: response.status,
//       buy_order: response.buy_order,
//       amount: response.amount,
//       authorization_code: response.authorization_code,
//       payment_type_code: response.payment_type_code,
//       response_code: response.response_code,
//       card_detail: response.card_detail,
//       accounting_date: response.accounting_date,
//       transaction_date: response.transaction_date,
//     });
//   } catch (error) {
//     console.error("Error al confirmar transacción Webpay:", error);
//     return res.status(500).json({
//       message: "Error interno al procesar el pago",
//       error: error.message,
//     });
//   }
// }
