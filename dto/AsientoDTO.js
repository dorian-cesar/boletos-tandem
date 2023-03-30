export class AsientoDTO {
    constructor(data, parrilla, asiento, piso) {
        this.asiento = asiento || '';
        this.codigoReserva = data?.codigoReserva || '';
        this.piso = piso || '';
        this.tarifa = piso == 1 ? parrilla?.tarifaPrimerPisoInternet : tarifaSegundoPisoInternet
    }
}