import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export const generateTicketsPDF = async (ticketData: any) => {
  try {
    console.log("Iniciando generación de boletos...");
    console.log("Datos recibidos:", ticketData);

    // Verificar si ticketData es válido
    if (!ticketData || typeof ticketData !== "object") {
      console.error("Datos de boletos no válidos");
      return;
    }

    // Iterar sobre cada propiedad del objeto principal
    for (const ticketId of Object.keys(ticketData)) {
      const ticketInfo = ticketData[ticketId];

      if (!ticketInfo) continue;

      // Verificar si tiene ida o vuelta
      if (ticketInfo.ida && Array.isArray(ticketInfo.ida)) {
        console.log(`Procesando IDA para ticket ${ticketId}`);
        await processTickets(ticketInfo.ida, "ida");
      }

      if (ticketInfo.vuelta && Array.isArray(ticketInfo.vuelta)) {
        console.log(`Procesando VUELTA para ticket ${ticketId}`);
        await processTickets(ticketInfo.vuelta, "vuelta");
      }
    }

    console.log("Generación de boletos completada");
  } catch (error) {
    console.error("Error en generateTicketsPDF:", error);
  }
};

const processTickets = async (trips: any[], tripType: string) => {
  try {
    for (const trip of trips) {
      if (!trip || !trip.asientos || !Array.isArray(trip.asientos)) continue;

      console.log(`Procesando viaje ${trip.id} (${tripType})`);

      for (const seat of trip.asientos) {
        await generateSingleTicketPDF(trip, seat, tripType);
      }
    }
  } catch (error) {
    console.error("Error en processTickets:", error);
  }
};

const generateSingleTicketPDF = async (
  trip: any,
  seat: any,
  tripType: string
) => {
  try {
    // Crear nuevo documento PDF
    const doc = new jsPDF();

    // Configuración inicial
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);

    // Logo o título de la empresa
    doc.text(trip.company || "Bus-Express", 105, 20, { align: "center" });

    // Tipo de boleto
    doc.setFontSize(16);
    doc.text(`Boleto de ${tripType === "ida" ? "Ida" : "Vuelta"}`, 105, 30, {
      align: "center",
    });

    // Línea divisoria
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);

    // Información del viaje
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    // Datos para el QR
    const qrData = JSON.stringify({
      id: trip.id,
      origin: trip.origin,
      destination: trip.destination,
      date: trip.date,
      seat: seat.asiento,
      authCode: seat.authCode || "N/A",
      price: seat.valorAsiento,
    });

    // Generar el código QR
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 80,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Añadir el QR al PDF
    doc.addImage(qrCodeDataURL, "PNG", 140, 40, 50, 50);

    // Información del viaje
    doc.text(`Origen: ${trip.origin}`, 20, 45);
    doc.text(`Destino: ${trip.destination}`, 20, 55);
    doc.text(`Fecha salida: ${trip.date}`, 20, 65);
    doc.text(`Hora salida: ${trip.departureTime}`, 20, 75);
    doc.text(`Fecha llegada: ${trip.arrivalDate}`, 20, 85);
    doc.text(`Hora llegada: ${trip.arrivalTime}`, 20, 95);

    // Información del asiento
    doc.setFont("helvetica", "bold");
    doc.text(`Asiento: ${seat.asiento}`, 20, 105);
    doc.text(`Piso: ${seat.floor === "floor1" ? "1" : "2"}`, 20, 115);

    // Tipo de asiento
    const seatType =
      seat.floor === "floor1"
        ? trip.seatDescriptionFirst
        : trip.seatDescriptionSecond;
    doc.text(`Tipo: ${seatType}`, 20, 125);

    // Precio
    doc.text(`Precio: $${seat.valorAsiento}`, 20, 135);

    // Código de autenticación
    doc.text(`Código: ${seat.authCode || "N/A"}`, 20, 145);

    // Línea divisoria final
    doc.line(20, 150, 190, 150);

    // Información de la empresa
    doc.setFontSize(10);
    doc.text("¡Gracias por viajar con nosotros!", 105, 160, { align: "center" });
    doc.text("Para consultas: contacto@empresa.com", 105, 170, {
      align: "center",
    });

    // Guardar el PDF
    const fileName = `Boleto_${trip.origin}_${trip.destination}_${trip.date}_${seat.asiento}.pdf`;
    doc.save(fileName);

    console.log(`PDF generado para asiento ${seat.asiento}`);
  } catch (error) {
    console.error(`Error al generar PDF para asiento ${seat?.asiento}:`, error);
  }
};
