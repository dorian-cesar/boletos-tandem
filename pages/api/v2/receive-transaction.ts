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

export const config = {
  api: {
    bodyParser: false, // no necesario para GET, pero no molesta
  },
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const token = req.query.token_ws;

    if (!token) {
      console.error("No se recibió token_ws de Transbank");
      return res.status(400).send("Error: No se recibió token_ws");
    }

    // Crear instancia de WebpayPlus
    const tx = new WebpayPlus.Transaction(
      new Options(
        process.env.TBK_COMMERCE_CODE,
        process.env.TBK_API_KEY_SECRET,
        Environment.Integration // o Environment.Production
      )
    );

    // Confirmar la transacción
    const response = await tx.commit(token);
    console.log("Webpay commit response:", response);

    // Redirigir al usuario a la página de confirmación con los datos
    const redirectUrl = `/confirm-transaction?status=${response.status}&amount=${response.amount}&buyOrder=${response.buy_order}`;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <html>
        <head>
          <meta http-equiv="refresh" content="0; url=${redirectUrl}" />
        </head>
        <body>
          Procesando pago...
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error al confirmar transacción Webpay:", error);
    res.status(500).send("Error interno al procesar el pago");
  }
}
