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

import type { NextApiRequest, NextApiResponse } from "next";
import { WebpayPlus, Environment, Options } from "transbank-sdk";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { token_ws } = req.body;

    if (!token_ws) {
      return res.status(400).json({ error: "No se recibió token_ws" });
    }

    // Crear instancia de WebpayPlus
    const tx = new WebpayPlus.Transaction(
      new Options(
        process.env.TBK_COMMERCE_CODE,
        process.env.TBK_API_KEY_SECRET,
        Environment.Integration // developer
        // Environment.Production // production
      )
    );

    // Confirmar transacción
    const response = await tx.commit(token_ws);

    console.log("Webpay commit response:", response);

    // Normalizar status para frontend
    let statusText = "REJECTED";
    if (response.status === "AUTHORIZED" || response.status === "APPROVED") {
      statusText = "AUTHORIZED";
    }

    return res.status(200).json({
      status: statusText,
      buyOrder: response.buyOrder,
      amount: response.amount,
      cardNumber: response.cardNumber,
    });
  } catch (error) {
    console.error("Error en commit Webpay:", error);
    return res.status(500).json({ error: error.message });
  }
}
