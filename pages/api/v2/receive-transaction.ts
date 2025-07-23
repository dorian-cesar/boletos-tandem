import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Flow envía los datos por x-www-form-urlencoded, no JSON
    // Next.js no lo parsea automáticamente en este formato
    // Necesitas usar un middleware o manejarlo manualmente

    // Si estás usando bodyParser por defecto, necesitas desactivarlo para esta ruta y usar algo como 'raw-body'
    console.log("Respuesta de Flow:", res);

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <html>
        <head>
          <meta http-equiv="refresh" content="0; url=/confirm-transaction" />
        </head>
        <body>
          Cargando...
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error procesando retorno de Flow:", error);
    res.status(500).json({ message: "Error interno" });
  }
}
