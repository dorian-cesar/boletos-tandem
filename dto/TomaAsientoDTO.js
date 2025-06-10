import dayjs from "dayjs";

export class TomaAsientoDTO {
    constructor(parrilla, startDate, endDate, asiento, piso, stage) {
        this.servicio = parrilla?.id;
        this.bus = piso == 1 ? parrilla?.seatDescriptionFirst : parrilla?.seatDescriptionSecond,
        this.fecha = parrilla?.date
        this.origen = parrilla?.terminalOrigin || '';
        this.destino = parrilla?.terminalDestination || '';
        this.integrador = parrilla?.integrador || 0;
        this.asiento = asiento || '';
        this.tarifa = piso == 1 ? parrilla?.priceFirst : parrilla?.priceSecond;
    }
}

export class LiberarAsientoDTO {
    constructor(parrilla, asiento, codigoReserva, piso) {
        this.servicio = parrilla?.servicio?.id || '';
        this.codigoReserva = codigoReserva || '';
        this.fecha = parrilla?.servicio?.date
        this.origen = parrilla?.servicio?.terminalOrigin || '';
        this.destino = parrilla?.servicio?.terminalDestination || '';
        this.integrador = parrilla?.servicio?.integrador || 0;
        this.asiento = asiento || '';
        this.tarifa = piso == 1 ? parrilla?.servicio?.priceFirst : parrilla?.servicio?.priceSecond;
    }
}