import { jsPDF } from "jspdf";
import pdf from "html-pdf-node";
import { Buffer } from "buffer";
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

// // Generar un solo boleto PDF (retorna base64)
// async function generateTicketPDF(
//   trip: any,
//   seat: any,
//   tripType: string,
//   authCode?: string,
//   token?: string
// ): Promise<{
//   fileName: string;
//   base64: string;
//   buffer: Buffer;
//   origin: string;
//   destination: string;
//   seat: string;
// }> {
//   const doc = new jsPDF();

//   // Colores modernos
//   const colors = {
//     primary: [41, 128, 185], // Azul moderno
//     secondary: [52, 73, 94], // Gris oscuro
//     accent: [231, 76, 60], // Rojo para destacar
//     success: [46, 204, 113], // Verde
//     light: [236, 240, 241], // Gris claro
//     white: [255, 255, 255],
//     text: [44, 62, 80],
//   };

//   // Fondo con gradiente simulado
//   doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
//   doc.rect(0, 0, 210, 297, "F");

//   // Header principal con fondo azul
//   doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
//   doc.roundedRect(10, 10, 190, 35, 3, 3, "F");

//   // Logo/Título principal
//   doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(24);
//   doc.text(trip.company || "BusExpress", 105, 25, { align: "center" });

//   doc.setFontSize(12);
//   doc.text(`Boleto de ${tripType === "ida" ? "Ida" : "Vuelta"}`, 105, 35, {
//     align: "center",
//   });

//   // Sección de información principal
//   doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
//   doc.roundedRect(10, 55, 190, 120, 3, 3, "F");

//   // Borde sutil
//   doc.setDrawColor(200, 200, 200);
//   doc.setLineWidth(0.5);
//   doc.roundedRect(10, 55, 190, 120, 3, 3, "S");

//   // Generar QR Code
//   const qrData = JSON.stringify({
//     origin: trip.origin,
//     destination: trip.destination,
//     date: trip.date,
//     departureTime: trip.departureTime,
//     arrivalDate: trip.arrivalDate,
//     arrivalTime: trip.arrivalTime,
//     seat: seat.asiento,
//     floor: seat.floor,
//     tipo:
//       seat.floor === "floor1"
//         ? trip.seatLayout.tipo_Asiento_piso_1
//         : trip.seatLayout.tipo_Asiento_piso_2,
//     price: seat.valorAsiento,
//     authCode: seat.authCode || authCode,
//     token: token,
//   });

//   const encoded = Buffer.from(qrData).toString("base64");
//   const qrUrl = `https://boletos-com.netlify.app/ver-boleto?data=${encoded}`;
//   const qrCodeDataURL = await QRCode.toDataURL(qrUrl, {
//     width: 120,
//     margin: 1,
//     color: {
//       dark: "#2c3e50",
//       light: "#ffffff",
//     },
//   });

//   // QR Code con marco
//   doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
//   doc.roundedRect(140, 60, 55, 55, 2, 2, "F");
//   doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
//   doc.setLineWidth(1);
//   doc.roundedRect(140, 60, 55, 55, 2, 2, "S");
//   doc.addImage(qrCodeDataURL, "PNG", 145, 65, 45, 45);

//   // Información del viaje con iconos simulados
//   doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
//   let yPos = 70;
//   const leftMargin = 20;
//   const iconSize = 4;

//   // Funciones utilitarias
//   const addIcon = (x, y, color) => {
//     doc.setFillColor(color[0], color[1], color[2]);
//     doc.circle(x, y - 2, iconSize / 2, "F");
//   };

//   // Origen
//   addIcon(leftMargin, yPos, colors.success);
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(11);
//   doc.text("ORIGEN", leftMargin + 8, yPos);
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(10);
//   doc.text(`${trip.terminalOrigin}`, leftMargin + 8, yPos + 5);
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(12);
//   doc.text(`${trip.origin}`, leftMargin + 8, yPos + 10);

//   yPos += 20;

//   // Destino
//   addIcon(leftMargin, yPos, colors.accent);
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(11);
//   doc.text("DESTINO", leftMargin + 8, yPos);
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(10);
//   doc.text(`${trip.terminalDestination}`, leftMargin + 8, yPos + 5);
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(12);
//   doc.text(`${trip.destination}`, leftMargin + 8, yPos + 10);

//   yPos += 20;

//   // Fecha y hora
//   doc.setFillColor(248, 249, 250);
//   doc.roundedRect(15, yPos - 5, 115, 25, 2, 2, "F");

//   addIcon(leftMargin, yPos, colors.primary);
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(10);
//   doc.setTextColor(
//     colors.secondary[0],
//     colors.secondary[1],
//     colors.secondary[2]
//   );
//   doc.text("SALIDA", leftMargin + 8, yPos);
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(11);
//   doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
//   doc.text(`${trip.departureTime}`, leftMargin + 8, yPos + 5);
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(9);
//   doc.text(`${trip.date}`, leftMargin + 8, yPos + 10);

//   // Llegada
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(10);
//   doc.setTextColor(
//     colors.secondary[0],
//     colors.secondary[1],
//     colors.secondary[2]
//   );
//   doc.text("LLEGADA", leftMargin + 60, yPos);
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(11);
//   doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
//   doc.text(`${trip.arrivalTime}`, leftMargin + 60, yPos + 5);
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(9);
//   doc.text(`${trip.arrivalDate}`, leftMargin + 60, yPos + 10);

//   // Detalles del asiento
//   doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
//   doc.roundedRect(10, 185, 190, 50, 3, 3, "F");
//   doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
//   doc.setLineWidth(1);
//   doc.roundedRect(10, 185, 190, 50, 3, 3, "S");

//   doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
//   doc.rect(10, 185, 190, 12, "F");
//   doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(12);
//   doc.text("DETALLES DEL ASIENTO", 105, 193, { align: "center" });

//   doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
//   const detailsY = 205;

//   // Columna 1
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(10);
//   doc.text("ASIENTO", 20, detailsY);
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(16);
//   doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
//   doc.text(`${seat.asiento}`, 20, detailsY + 8);

//   // Columna 2
//   doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(10);
//   doc.text("PISO", 60, detailsY);
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(12);
//   doc.text(`${seat.floor === "floor1" ? "1" : "2"}`, 60, detailsY + 8);

//   // Columna 3
//   const seatType =
//     seat.floor === "floor1"
//       ? trip.seatLayout.tipo_Asiento_piso_1
//       : trip.seatLayout.tipo_Asiento_piso_2;

//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(10);
//   doc.text("TIPO", 100, detailsY);
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(12);
//   doc.text(`${seatType}`, 100, detailsY + 8);

//   // Columna 4 - Precio
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(10);
//   doc.text("PRECIO", 150, detailsY);
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(14);
//   doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
//   doc.text(`${seat.valorAsiento} Gs.`, 150, detailsY + 8);

//   // Código de transacción
//   doc.setFillColor(248, 249, 250);
//   doc.roundedRect(10, 245, 190, 20, 2, 2, "F");
//   doc.setTextColor(
//     colors.secondary[0],
//     colors.secondary[1],
//     colors.secondary[2]
//   );
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(9);
//   doc.text("CÓDIGO DE TRANSACCIÓN:", 20, 252);
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(10);
//   doc.text(`${seat.authCode || authCode || "N/A"}`, 20, 260);

//   // Footer
//   doc.setFillColor(
//     colors.secondary[0],
//     colors.secondary[1],
//     colors.secondary[2]
//   );
//   doc.roundedRect(10, 275, 190, 15, 2, 2, "F");
//   doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(10);
//   doc.text("\u00a1Gracias por viajar con nosotros!", 105, 283, {
//     align: "center",
//   });

//   // Instrucciones
//   doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(8);
//   doc.text(
//     "\u2022 Presenta este boleto al abordar \u2022 Lleva identificaci\u00f3n v\u00e1lida \u2022 Llega 30 minutos antes",
//     105,
//     292,
//     {
//       align: "center",
//     }
//   );

//   // Generar nombre de archivo
//   const fileName = `Boleto_${trip.origin}_${trip.destination}_${trip.date}_${seat.asiento}.pdf`;

//   // Convertir a base64 para el frontend y buffer para el email
//   const base64 = doc.output("datauristring");
//   const buffer = Buffer.from(doc.output("arraybuffer"));

//   return {
//     fileName,
//     base64,
//     buffer,
//     origin: trip.origin,
//     destination: trip.destination,
//     seat: seat.asiento,
//   };
// }

export async function generateTicketPDF(
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
  const qrImage = await QRCode.toDataURL(qrUrl, {
    width: 200,
    margin: 1,
    color: {
      dark: "#1a1a1a",
      light: "#ffffff",
    },
  });

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #ffffff;
      padding: 0;
      margin: 0;
      height: 100vh;
      overflow: hidden;
    }
    
    .ticket-container {
      width: 100%;
      height: 100vh;
      background: #ffffff;
      position: relative;
      display: flex;
      flex-direction: column;
    }
    
    .ticket-header {
      background: #1e293b;
      padding: 25px 50px;
      text-align: center;
      color: white;
      border-bottom: 4px solid #334155;
      position: relative;
    }
    
    .company-name {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    
    .trip-type {
      font-size: 16px;
      font-weight: 400;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #cbd5e1;
    }
    
    .ticket-body {
      padding: 30px 50px;
      background: #ffffff;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .route-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 25px;
      position: relative;
      background: #f8fafc;
      padding: 25px;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
    }
    
    .route-point {
      flex: 1;
      text-align: center;
    }
    
    .route-connector {
      flex: 0 0 120px;
      height: 3px;
      background: #334155;
      margin: 0 30px;
      position: relative;
    }
    
    .route-connector::before {
      content: '→';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #1e293b;
      color: white;
      padding: 10px 12px;
      border-radius: 50%;
      font-size: 18px;
      font-weight: bold;
    }
    
    .location-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    .location-name {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 6px;
    }
    
    .terminal-name {
      font-size: 14px;
      color: #64748b;
      font-weight: 400;
    }
    
    .datetime-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 25px;
      gap: 30px;
    }
    
    .datetime-card {
      flex: 1;
      background: #ffffff;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      border: 2px solid #e2e8f0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    
    .datetime-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      font-weight: 600;
    }
    
    .datetime-value {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      line-height: 1.3;
    }
    
    .details-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 40px;
      margin-bottom: 20px;
    }
    
    .seat-details {
      flex: 1;
    }
    
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .detail-item {
      background: #ffffff;
      padding: 15px;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .detail-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    .detail-value {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }
    
    .qr-section {
      flex: 0 0 200px;
      text-align: center;
      background: #ffffff;
      padding: 30px;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    
    .qr-label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 20px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .qr-code {
      width: 140px;
      height: 140px;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
    }
    
    .auth-section {
      background: #f8fafc;
      padding: 20px;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      margin-bottom: 0;
    }
    
    .auth-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      font-weight: 600;
    }
    
    .auth-code {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      font-family: 'Courier New', monospace;
      background: white;
      padding: 12px 16px;
      border-radius: 8px;
      border: 2px solid #d1d5db;
      display: inline-block;
    }
    
    .footer {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      color: #1e293b;
      padding: 30px 50px;
      text-align: center;
      border: 2px solid #cbd5e1;
      border-radius: 16px;
      margin: 0px 50px 15px 50px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .footer-title {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 20px;
      color: #1e293b;
      letter-spacing: -0.5px;
    }

    .footer-instructions {
      display: flex;
      justify-content: space-around;
      align-items: center;
      margin-bottom: 15px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .instruction-item {
      display: flex;
      align-items: center;
      font-size: 13px;
      font-weight: 500;
      color: #475569;
      background: white;
      padding: 8px 16px;
      border-radius: 20px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      white-space: nowrap;
    }

    .instruction-item::before {
      content: '✓';
      display: inline-block;
      width: 16px;
      height: 16px;
      background: #10b981;
      color: white;
      border-radius: 50%;
      font-size: 10px;
      font-weight: bold;
      text-align: center;
      line-height: 16px;
      margin-right: 8px;
      flex-shrink: 0;
    }

    .footer-note {
      font-size: 11px;
      color: #64748b;
      font-style: italic;
      margin-top: 10px;
      opacity: 0.8;
    }
    
    .company-info {
      background: #1e293b;
      color: #cbd5e1;
      padding: 20px 50px;
      text-align: center;
      border-top: 3px solid #334155;
      font-size: 12px;
      font-weight: 400;
      letter-spacing: 0.5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }

    .company-left {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .company-right {
      font-size: 11px;
      opacity: 0.7;
    }

    .company-logo {
      width: 20px;
      height: 20px;
      background: #10b981;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 10px;
    }

    /* Bordes laterales del ticket */
    .ticket-container::before,
    .ticket-container::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #1e293b;
      z-index: 10;
    }

    .ticket-container::before {
      left: 20px;
    }

    .ticket-container::after {
      right: 20px;
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="ticket-header">
      <div class="company-name">${trip.company || "BusExpress"}</div>
      <div class="trip-type">Boleto de ${
        tripType === "ida" ? "Ida" : "Vuelta"
      }</div>
    </div>
    
    <div class="ticket-body">
      <div class="route-section">
        <div class="route-point">
          <div class="location-label">Origen</div>
          <div class="location-name">${trip.origin}</div>
          <div class="terminal-name">${trip.terminalOrigin}</div>
        </div>
        <div class="route-connector"></div>
        <div class="route-point">
          <div class="location-label">Destino</div>
          <div class="location-name">${trip.destination}</div>
          <div class="terminal-name">${trip.terminalDestination}</div>
        </div>
      </div>
      
      <div class="datetime-section">
        <div class="datetime-card">
          <div class="datetime-label">Salida</div>
          <div class="datetime-value">${trip.date}<br>${
    trip.departureTime
  }</div>
        </div>
        <div class="datetime-card">
          <div class="datetime-label">Llegada</div>
          <div class="datetime-value">${trip.arrivalDate}<br>${
    trip.arrivalTime
  }</div>
        </div>
      </div>
      
      <div class="details-section">
        <div class="seat-details">
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-label">Asiento</div>
              <div class="detail-value">${seat.asiento}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Piso</div>
              <div class="detail-value">${
                seat.floor === "floor1" ? "1" : "2"
              }</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Tipo</div>
              <div class="detail-value">${
                seat.floor === "floor1"
                  ? trip.seatLayout.tipo_Asiento_piso_1
                  : trip.seatLayout.tipo_Asiento_piso_2
              }</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Precio</div>
              <div class="detail-value">${seat.valorAsiento} Gs.</div>
            </div>
          </div>
        </div>
        
        <div class="qr-section">
          <div class="qr-label">Código QR</div>
          <img src="${qrImage}" alt="QR Code" class="qr-code" />
        </div>
      </div>
      
      <div class="auth-section">
        <div class="auth-label">Código de Transacción</div>
        <div class="auth-code">${seat.authCode || authCode || "N/A"}</div>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-title">¡Gracias por viajar con nosotros!</div>
      <div class="footer-instructions">
        <span class="instruction-item">Presenta este boleto al abordar</span>
        <span class="instruction-item">Lleva identificación válida</span>
        <span class="instruction-item">Llega 30 minutos antes</span>
      </div>
      <div class="footer-note">
        Este boleto es intransferible y válido únicamente para la fecha y horario especificados
      </div>
    </div>
    
    <div class="company-info">
      <div class="company-left">
        <div class="company-logo">B</div>
        <span>Boleto generado electrónicamente</span>
      </div>
      <div class="company-right">
        Sistema de reservas BusExpress © ${new Date().getFullYear()}
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const options = {
    format: "A4",
    printBackground: true,
    margin: {
      top: "10mm",
      right: "10mm",
      bottom: "10mm",
      left: "10mm",
    },
  };

  const pdfBuffer = await pdf.generatePdf({ content: htmlContent }, options);
  const buffer = Buffer.from(pdfBuffer);
  const base64 = `data:application/pdf;base64,${buffer.toString("base64")}`;
  const fileName = `Boleto_${trip.origin}_${trip.destination}_${trip.date}_Asiento:${seat.asiento}.pdf`;

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
