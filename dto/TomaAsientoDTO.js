import dayjs from "dayjs";

export class TomaAsientoDTO {
    constructor(parrilla, startDate, endDate, asiento, piso, stage) {
        this.servicio = parrilla?.idServicio || '';
        this.bus = piso == 1 ? parrilla?.busPiso1 : parrilla?.busPiso2,
        this.fecha = parrilla?.fechaServicio
        this.origen = parrilla?.idTerminalOrigen || '';
        this.destino = parrilla?.idTerminalDestino || '';
        this.integrador = parrilla?.integrador || 0;
        this.asiento = asiento || '';
        this.tarifa = piso == 1 ? parrilla?.tarifaPrimerPisoInternet : parrilla?.tarifaSegundoPisoInternet;
    }
}

export class LiberarAsientoDTO {
    constructor(parrilla, asiento, codigoReserva, piso) {
        this.servicio = parrilla?.servicio?.idServicio || '';
        this.codigoReserva = codigoReserva || '';
        this.fecha = parrilla?.servicio?.fechaServicio
        this.origen = parrilla?.servicio?.idTerminalOrigen || '';
        this.destino = parrilla?.servicio?.idTerminalDestino || '';
        this.integrador = parrilla?.servicio?.integrador || 0;
        this.asiento = asiento || '';
        this.tarifa = piso == 1 ? parrilla?.servicio?.tarifaPrimerPisoInternet : parrilla?.servicio?.tarifaSegundoPisoInternet;
    }
}