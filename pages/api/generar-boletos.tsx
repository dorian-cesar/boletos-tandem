import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { createTransport } from "nodemailer";
import { NextApiRequest, NextApiResponse } from "next";
import Mail from "nodemailer/lib/mailer";

interface TicketData {
  ticketData: any;
  email: string;
  authCode?: string;
  token?: string;
  customerName?: string;
  bookingReference?: string;
}

interface TicketResponse {
  success: boolean;
  message: string;
  tickets: Array<{
    fileName: string;
    base64: string;
  }>;
  emailSent: string;
}

interface EmailTicket {
  fileName: string;
  buffer: Buffer;
  origin: string;
  destination: string;
  seat: string;
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<TicketResponse>
) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Método no permitido",
      tickets: [],
      emailSent: "",
    });
  }

  try {
    const {
      ticketData,
      email,
      authCode,
      token,
      customerName,
      bookingReference,
    }: TicketData = req.body;
    console.log("Datos recibidos:", { ticketData, email });

    if (!ticketData || !email) {
      return res.status(400).json({
        success: false,
        message: "Datos incompletos",
        tickets: [],
        emailSent: "",
      });
    }

    // 1. Generar los boletos en PDF
    const { generatedTickets } = await generateAllTicketsPDF(
      ticketData,
      authCode,
      token
    );

    // 2. Enviar por email
    const emailResult = await sendTicketsByEmail({
      customerEmail: email,
      tickets: generatedTickets.map((t) => ({
        fileName: t.fileName,
        buffer: t.buffer,
        origin: t.origin,
        destination: t.destination,
        seat: t.seat,
      })),
      customerName,
      bookingReference,
    });

    if (!emailResult.success) {
      throw new Error(emailResult.message);
    }

    // 3. Preparar respuesta para el frontend
    const frontendTickets = generatedTickets.map((ticket) => ({
      fileName: ticket.fileName,
      base64: ticket.base64,
    }));

    res.status(200).json({
      success: true,
      message: "Boletos generados y enviados correctamente",
      tickets: frontendTickets,
      emailSent: email,
    });
  } catch (error) {
    console.error("Error en el endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud: " + error.message,
      tickets: [],
      emailSent: "",
    });
  }
};

// Función para generar todos los boletos (retorna base64)
async function generateAllTicketsPDF(
  ticketData: any,
  authCode?: string,
  token?: string
): Promise<{
  generatedTickets: Array<{
    fileName: string;
    base64: string;
    buffer: Buffer;
    origin: string;
    destination: string;
    seat: string;
  }>;
}> {
  const generatedTickets = [];

  for (const ticketId of Object.keys(ticketData)) {
    const ticketInfo = ticketData[ticketId];
    if (!ticketInfo) continue;

    if (ticketInfo.ida) {
      await processTrips(
        ticketInfo.ida,
        "ida",
        generatedTickets,
        authCode,
        token
      );
    }

    if (ticketInfo.vuelta) {
      await processTrips(
        ticketInfo.vuelta,
        "vuelta",
        generatedTickets,
        authCode,
        token
      );
    }
  }

  return { generatedTickets };
}

// Procesar viajes y generar PDFs
async function processTrips(
  trips: any[],
  tripType: string,
  generatedTickets: any[],
  authCode?: string,
  token?: string
): Promise<void> {
  for (const trip of trips) {
    if (!trip?.asientos?.length) continue;

    for (const seat of trip.asientos) {
      const ticket = await generateTicketPDF(
        trip,
        seat,
        tripType,
        authCode,
        token
      );
      generatedTickets.push(ticket);
    }
  }
}

// Generar un solo boleto PDF (retorna base64)
async function generateTicketPDF(
  trip: any,
  seat: any,
  tripType: string,
  authCode?: string,
  token?: string
): Promise<{
  fileName: string;
  base64: string;
  buffer: Buffer;
  origin: string;
  destination: string;
  seat: string;
}> {
  const doc = new jsPDF();

  // Colores modernos
  const colors = {
    primary: [41, 128, 185], // Azul moderno
    secondary: [52, 73, 94], // Gris oscuro
    accent: [231, 76, 60], // Rojo para destacar
    success: [46, 204, 113], // Verde
    light: [236, 240, 241], // Gris claro
    white: [255, 255, 255],
    text: [44, 62, 80],
  };

  // Fondo con gradiente simulado
  doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
  doc.rect(0, 0, 210, 297, "F");

  // Header principal con fondo azul
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.roundedRect(10, 10, 190, 35, 3, 3, "F");

  // Logo/Título principal
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(trip.company || "BusExpress", 105, 25, { align: "center" });

  doc.setFontSize(12);
  doc.text(`Boleto de ${tripType === "ida" ? "Ida" : "Vuelta"}`, 105, 35, {
    align: "center",
  });

  // Sección de información principal
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.roundedRect(10, 55, 190, 120, 3, 3, "F");

  // Borde sutil
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.roundedRect(10, 55, 190, 120, 3, 3, "S");

  // Generar QR Code
  const qrData = JSON.stringify({
    origin: trip.origin,
    destination: trip.destination,
    date: trip.date,
    departureTime: trip.departureTime,
    arrivalDate: trip.arrivalDate,
    arrivalTime: trip.arrivalTime,
    seat: seat.asiento,
    floor: seat.floor,
    tipo:
      seat.floor === "floor1"
        ? trip.seatLayout.tipo_Asiento_piso_1
        : trip.seatLayout.tipo_Asiento_piso_2,
    price: seat.valorAsiento,
    authCode: seat.authCode || authCode,
    token: token,
  });

  const encoded = Buffer.from(qrData).toString("base64");
  const qrUrl = `https://boletos-com.netlify.app/ver-boleto?data=${encoded}`;
  const qrCodeDataURL = await QRCode.toDataURL(qrUrl, {
    width: 120,
    margin: 1,
    color: {
      dark: "#2c3e50",
      light: "#ffffff",
    },
  });

  // QR Code con marco
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.roundedRect(140, 60, 55, 55, 2, 2, "F");
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(1);
  doc.roundedRect(140, 60, 55, 55, 2, 2, "S");
  doc.addImage(qrCodeDataURL, "PNG", 145, 65, 45, 45);

  // Información del viaje con iconos simulados
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  let yPos = 70;
  const leftMargin = 20;
  const iconSize = 4;

  // Funciones utilitarias
  const addIcon = (x, y, color) => {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.circle(x, y - 2, iconSize / 2, "F");
  };

  // Origen
  addIcon(leftMargin, yPos, colors.success);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("ORIGEN", leftMargin + 8, yPos);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${trip.terminalOrigin}`, leftMargin + 8, yPos + 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`${trip.origin}`, leftMargin + 8, yPos + 10);

  yPos += 20;

  // Destino
  addIcon(leftMargin, yPos, colors.accent);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DESTINO", leftMargin + 8, yPos);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${trip.terminalDestination}`, leftMargin + 8, yPos + 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`${trip.destination}`, leftMargin + 8, yPos + 10);

  yPos += 20;

  // Fecha y hora
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(15, yPos - 5, 115, 25, 2, 2, "F");

  addIcon(leftMargin, yPos, colors.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(
    colors.secondary[0],
    colors.secondary[1],
    colors.secondary[2]
  );
  doc.text("SALIDA", leftMargin + 8, yPos);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.text(`${trip.departureTime}`, leftMargin + 8, yPos + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${trip.date}`, leftMargin + 8, yPos + 10);

  // Llegada
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(
    colors.secondary[0],
    colors.secondary[1],
    colors.secondary[2]
  );
  doc.text("LLEGADA", leftMargin + 60, yPos);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.text(`${trip.arrivalTime}`, leftMargin + 60, yPos + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${trip.arrivalDate}`, leftMargin + 60, yPos + 10);

  // Detalles del asiento
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.roundedRect(10, 185, 190, 50, 3, 3, "F");
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(1);
  doc.roundedRect(10, 185, 190, 50, 3, 3, "S");

  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(10, 185, 190, 12, "F");
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("DETALLES DEL ASIENTO", 105, 193, { align: "center" });

  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  const detailsY = 205;

  // Columna 1
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("ASIENTO", 20, detailsY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(`${seat.asiento}`, 20, detailsY + 8);

  // Columna 2
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("PISO", 60, detailsY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`${seat.floor === "floor1" ? "1" : "2"}`, 60, detailsY + 8);

  // Columna 3
  const seatType =
    seat.floor === "floor1"
      ? trip.seatLayout.tipo_Asiento_piso_1
      : trip.seatLayout.tipo_Asiento_piso_2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TIPO", 100, detailsY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`${seatType}`, 100, detailsY + 8);

  // Columna 4 - Precio
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("PRECIO", 150, detailsY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text(`${seat.valorAsiento} Gs.`, 150, detailsY + 8);

  // Código de transacción
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(10, 245, 190, 20, 2, 2, "F");
  doc.setTextColor(
    colors.secondary[0],
    colors.secondary[1],
    colors.secondary[2]
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CÓDIGO DE TRANSACCIÓN:", 20, 252);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${seat.authCode || authCode || "N/A"}`, 20, 260);

  // Footer
  doc.setFillColor(
    colors.secondary[0],
    colors.secondary[1],
    colors.secondary[2]
  );
  doc.roundedRect(10, 275, 190, 15, 2, 2, "F");
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("\u00a1Gracias por viajar con nosotros!", 105, 283, {
    align: "center",
  });

  // Instrucciones
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    "\u2022 Presenta este boleto al abordar \u2022 Lleva identificaci\u00f3n v\u00e1lida \u2022 Llega 30 minutos antes",
    105,
    292,
    {
      align: "center",
    }
  );

  // Generar nombre de archivo
  const fileName = `Boleto_${trip.origin}_${trip.destination}_${trip.date}_${seat.asiento}.pdf`;

  // Convertir a base64 para el frontend y buffer para el email
  const base64 = doc.output("datauristring");
  const buffer = Buffer.from(doc.output("arraybuffer"));

  return {
    fileName,
    base64,
    buffer,
    origin: trip.origin,
    destination: trip.destination,
    seat: seat.asiento,
  };
}

// Función mejorada para enviar boletos por email
async function sendTicketsByEmail(options: {
  customerEmail: string;
  tickets: EmailTicket[];
  customerName?: string;
  bookingReference?: string;
}): Promise<{ success: boolean; message: string }> {
  const {
    customerEmail,
    tickets,
    customerName = "Estimado cliente",
    bookingReference = "",
  } = options;

  try {
    // 1. Validaciones iniciales
    if (!customerEmail || !tickets?.length) {
      throw new Error("Se requiere email del cliente y al menos un boleto");
    }

    // 2. Configurar transporte de correo
    const transporter = createTransport({
      service: process.env.EMAIL_SERVICE || "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === "production",
      },
    });

    // 3. Preparar adjuntos
    const attachments: Mail.Attachment[] = tickets.map((ticket) => ({
      filename: ticket.fileName,
      content: ticket.buffer,
      contentType: "application/pdf",
    }));

    // 4. Preparar contenido del correo
    const emailSubject = `Boletos.com - Tus boletos de viaje ${
      bookingReference ? `(Ref: ${bookingReference})` : ""
    }`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #2c3e50;">¡Gracias por viajar con BusExpress!</h1>
        
        <p>Hola ${customerName},</p>
        
        <p>Adjunto encontrarás tus ${
          tickets.length
        } boleto(s) de viaje. Por favor revisa los detalles:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Resumen de tu compra:</h3>
          <ul style="padding-left: 20px;">
            ${tickets
              .map(
                (t) => `
              <li style="margin-bottom: 8px;">
                <strong>${t.origin} a ${t.destination} - Asiento ${t.seat}</strong>
              </li>
            `
              )
              .join("")}
          </ul>
          ${
            bookingReference
              ? `<p><strong>Referencia:</strong> ${bookingReference}</p>`
              : ""
          }
        </div>
        
        <h3 style="color: #2c3e50;">Instrucciones importantes:</h3>
        <ol>
          <li>Presenta este boleto (impreso o en tu móvil) al abordar el bus</li>
          <li>Lleva una identificación válida</li>
          <li>Llega al menos 30 minutos antes de la salida</li>
        </ol>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #e9f7fe; border-radius: 5px;">
          <h4 style="margin-top: 0;">¿Necesitas ayuda?</h4>
          <p style="margin-bottom: 0;">
            Contáctanos en <a href="mailto:soporte@busexpress.com">soporte@busexpress.com</a> o al +56 2 2345 6789
          </p>
        </div>
        
        <p style="margin-top: 30px;">¡Te deseamos un excelente viaje!</p>
        <p><strong>El equipo de BusExpress</strong></p>
      </div>
    `;

    // 5. Configurar opciones del correo
    const mailOptions: Mail.Options = {
      from: process.env.EMAIL_FROM || "no-reply@busexpress.com",
      to: customerEmail,
      subject: emailSubject,
      html: emailHtml,
      text: `Hola ${customerName},\n\nAdjunto encontrarás tus ${
        tickets.length
      } boleto(s) de viaje. Por favor presenta estos boletos al abordar el bus junto con tu identificación.\n\nReferencia: ${
        bookingReference || "N/A"
      }\n\n¡Gracias por viajar con BusExpress!`,
      attachments,
    };

    // 6. Verificar conexión SMTP antes de enviar
    await transporter.verify();

    // 7. Enviar el correo electrónico
    const info = await transporter.sendMail(mailOptions);

    console.log(`Correo enviado a ${customerEmail}`, info.messageId);
    return {
      success: true,
      message: `Los boletos han sido enviados a ${customerEmail}`,
    };
  } catch (error) {
    console.error("Error al enviar boletos por correo:", error);

    let errorMessage = "Error al enviar los boletos por correo electrónico";
    if (error.code === "EAUTH") {
      errorMessage = "Error de autenticación con el servicio de correo";
    } else if (error.code === "EENVELOPE") {
      errorMessage = "La dirección de correo electrónico no es válida";
    }

    return {
      success: false,
      message: `${errorMessage}: ${error.message}`,
    };
  }
}
