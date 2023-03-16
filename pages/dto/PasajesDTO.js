import dayjs from "dayjs";

export class PasajeConvenioDTO {
    constructor(data) {
        this.asiento = data?.asiento || '';
        this.bus = data?.bus || '';
        this.clase = data?.clase || '';
        this.descuento = data?.descuento || '0';
        this.destino = data?.destino || '';
        this.fechaSalida = dayjs(data?.fechaSalida, 'DD/MM/YYYY').format('YYYYMMDD');
        this.horaSalida = data?.horaSalida || '';
        this.idServicio = data?.idServicio || '';
        this.origen = data?.origen || '';
        this.pago = data?.tarifa || '';
        this.valor = Math.round(data?.tarifa.replace('.', '') * 1.1);
        this.piso = data?.piso || '';
        this.promocion = data?.promocion || '0';
    }
}