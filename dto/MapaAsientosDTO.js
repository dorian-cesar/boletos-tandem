import dayjs from "dayjs";

export class BuscarPlanillaVerticalDTO {
    constructor(parrillaTemporal, stage, startDate, endDate, parrilla) {
        this.idServicio = parrillaTemporal?.idServicio || '';
        this.tipoBusPiso1 = parrillaTemporal?.busPiso1 || '';
        this.tipoBusPiso2 = parrillaTemporal?.busPiso2 || '';
        this.fechaServicio = dayjs(stage == 0 ? startDate : endDate).format('DD/MM/YYYY');
        this.idOrigen = parrilla?.idTerminalOrigen || '';
        this.idDestino = parrilla?.idTerminalDestino || '';
        this.integrador = parrilla?.integrador || 0;
    }
}