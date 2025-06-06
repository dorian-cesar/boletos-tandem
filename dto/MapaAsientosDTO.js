import dayjs from "dayjs";

// export class BuscarPlanillaVerticalDTO {
//     constructor(parrillaTemporal, stage, startDate, endDate, parrilla) {
//         // this.idServicio = parrillaTemporal?.idServicio || '';
//         this.idServicio = parrillaTemporal?.id || '';
//         this.tipoBusPiso1 = parrillaTemporal?.busPiso1 || '';
//         this.tipoBusPiso2 = parrillaTemporal?.busPiso2 || '';
//         this.fechaServicio = dayjs(stage == 0 ? startDate : endDate).format('DD/MM/YYYY');
//         this.idOrigen = parrilla?.idTerminalOrigen || '';
//         this.idDestino = parrilla?.idTerminalDestino || '';
//         this.integrador = parrilla?.integrador || 0;
//         this.horaServicio = parrilla?.horaSalida.replace(':','') || "";
//         this.clasePiso1 = parrilla?.idClaseBusPisoUno || "";
//         this.clasePiso2 = parrilla?.idClaseBusPisoDos || "";
//         this.empresa = parrilla?.empresa || "";
//     }
// }

// export class BuscarPlanillaVerticalOpenPaneDTO {
//     constructor(parrilla) {
//         this.idServicio = parrilla?.idServicio || '';
//         this.tipoBusPiso1 = parrilla?.busPiso1 || '';
//         this.tipoBusPiso2 = parrilla?.busPiso2 || '';
//         this.fechaServicio = parrilla?.fechaServicio || '';
//         this.idOrigen = parrilla?.idTerminalOrigen || '';
//         this.idDestino = parrilla?.idTerminalDestino || '';
//         this.integrador = parrilla?.integrador || 0;
//         this.horaServicio = parrilla?.horaSalida.replace(':','') || "";
//         this.clasePiso1 = parrilla?.idClaseBusPisoUno || "";
//         this.clasePiso2 = parrilla?.idClaseBusPisoDos || "";
//         this.empresa = parrilla?.empresa || "";
//     }
// }

export class BuscarPlanillaVerticalDTO {
  constructor(parrillaTemporal, stage, startDate, endDate, parrilla) {
    this.idServicio = parrillaTemporal?.id || "";
    this.tipoBusPiso1 = parrilla?.seatDescriptionFirst || "";
    this.tipoBusPiso2 = parrilla?.seatDescriptionSecond || "";
    this.fechaServicio = dayjs(stage == 0 ? startDate : endDate).format(
      "DD/MM/YYYY"
    );
    this.idOrigen = parrilla?.terminalOrigin || "";
    this.idDestino = parrilla?.terminalDestination || "";
    this.integrador = parrilla?.integrador || 0;
    this.horaServicio = parrilla?.departureTime.replace(":", "") || "";
    this.clasePiso1 = parrilla?.idClaseBusPisoUno || "";
    this.clasePiso2 = parrilla?.idClaseBusPisoDos || "";
    this.empresa = parrilla?.empresa || "";
  }
}

export class BuscarPlanillaVerticalOpenPaneDTO {
  constructor(parrilla) {
    this.idServicio = parrilla?.id || "";
    this.tipoBusPiso1 = parrilla?.seatDescriptionFirst || "";
    this.tipoBusPiso2 = parrilla?.seatDescriptionSecond || "";
    this.fechaServicio = parrilla?.date || "";
    this.idOrigen = parrilla?.terminalOrigin || "";
    this.idDestino = parrilla?.terminalDestination || "";
    this.integrador = parrilla?.integrador || 0;
    this.horaServicio = parrilla?.departureTime.replace(":", "") || "";
    this.clasePiso1 = parrilla?.idClaseBusPisoUno || "";
    this.clasePiso2 = parrilla?.idClaseBusPisoDos || "";
    this.empresa = parrilla?.empresa || "";
  }
}
