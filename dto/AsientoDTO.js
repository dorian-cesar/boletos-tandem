export class AsientoDTO {
    constructor(data, parrilla, asiento, piso) {
        this.asiento = asiento || '';
        this.codigoReserva = data?.codigoReserva || '';
        this.piso = piso || '';
        this.tarifa = piso == 1 ? parrilla?.tarifaPrimerPisoInternet : parrilla?.tarifaSegundoPisoInternet
        this.tipoMascota == asiento.asientoAsociado ? true : false;
        this.relacionAsiento == asiento.asientoAsociado ? asiento.asientoAsociado : "";
    }
}