import dayjs from "dayjs";

export class TomaAsientoDTO {
    constructor(parrilla, startDate, endDate, asiento, piso, stage) {
        this.servicio = parrilla?.idServicio || '';
        this.bus = piso == 1 ? parrilla?.busPiso1 : parrilla?.busPiso2,
        this.fecha = dayjs(stage == 0 ? startDate : endDate).format('DD/MM/YYYY');
        this.origen = parrilla?.idTerminalOrigen || '';
        this.destino = parrilla?.idTerminalDestino || '';
        this.integrador = parrilla?.integrador || 0;
        this.asiento = asiento.asiento || '';
        this.tarifa = piso == 1 ? parrilla?.tarifaPrimerPisoInternet : parrilla?.tarifaSegundoPisoInternet;
    }
}