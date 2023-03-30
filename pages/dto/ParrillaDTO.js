import dayjs from "dayjs";

export class ObtenerParrillaServicioDTO {
    constructor(stage_active, origen, destino, startDate, endDate) {
        this.origen = stage_active == 0 ? origen : destino;
        this.destino = stage_active == 0 ? destino : origen;
        this.startDate = dayjs(stage_active == 0 ? startDate : endDate).format("YYYYMMDD");
    }
}