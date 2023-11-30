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

export class PasajeDTO {
    constructor(pasaje, asiento, isOpen = true) {
        this.idServicio = pasaje?.idServicio || '';
        this.fechaServicio = pasaje?.fechaServicio || '';
        this.fechaSalida = pasaje?.fechaSalida || '';
        this.fechaLlegada = pasaje?.fechaLlegada || '';
        this.integrador = pasaje?.integrador || 0;
        this.horaSalida = pasaje?.horaSalida || '';
        this.empresa = pasaje?.empresa || '';
        this.bus = asiento?.piso == 1 ? pasaje?.busPiso1 : pasaje?.busPiso2;
        this.origen = pasaje?.idTerminalOrigen || '';
        this.destino = pasaje?.idTerminalDestino || '';
        this.codigoReserva = 1;
        this.clase = pasaje?.idClaseBusPisoUno || '';
        this.tarifa = asiento?.piso == 1 ? pasaje?.tarifaPrimerPisoInternet : pasaje?.tarifaSegundoPisoInternet;
        this.servicio = asiento?.piso == 1 ? pasaje?.servicioPrimerPiso : pasaje?.servicioSegundoPiso; 
        this.piso = asiento?.piso || 1;
        this.pet = asiento?.pet || '';
        this.asiento = asiento || '';
        this.open = isOpen;
        this.extras = pasaje;
        this.pasajero = {
            tipo: 'rut',
            nacionalidad: 'CHL',
            errors: []
        }
    }
}

export class PasajePagoDTO {
    constructor(pasaje, pasajero, extras, convenioActivo, precio, datoConvenio) {
        this.servicio = pasaje?.idServicio || '';
        this.fechaServicio = extras?.fechaServicio || '';
        this.fechaPasada = extras?.fechaLlegada || '';
        this.fechaLlegada = extras?.fechaLlegada || '';
        this.horaSalida = pasaje?.horaSalida || '';
        this.horaLlegada = extras?.horaLlegada || '';
        this.origen = pasaje?.origen || '';
        this.destino = pasaje?.destino || '';
        this.codigoReserva = '1';
        this.descuento = 0;
        this.empresa = extras?.empresa || '';
        this.clase = pasaje?.clase || '';
        this.bus = pasaje?.bus || '';
        this.integrador = 1000;
        this.monto = pasaje?.tarifa.replace(',', '') || '';
        this.precio = precio;
        this.idaVuelta = false;
        this.piso = pasaje?.piso || '';
        this.asiento = pasaje?.asiento?.asiento || '';
        this.datoConvenio = datoConvenio || '';
        this.convenio = convenioActivo || '';
        this.pasajero = {
            comunaDestino: "14000001",
            comunaOrigen: "14000001",
            documento: pasajero?.rut.replace(".", "").replace(".", ""),
            email: pasajero?.email || '',
            nacionalidad: pasajero?.nacionalidad || '',
            nombre: pasajero?.nombre || '',
            apellido: pasajero?.apellido || '',
            telefono: pasajero?.telefono || '',
            telefonoEmergencia: "955555555",
            tipoDocumento: "R",
        };
        this.tipoServicio = null;
        this.asientoAsociado = null;
    }
}

export class GuardarCarroDTO {
    constructor(email, rut, total, carrito) {
        this.email = email || '';
        this.rut = rut.replace(".", "").replace(".", "") || '';
        this.medioDePago = 'WBPAY';
        this.montoTotal = total;
        this.idSistema = 7;
        this.listaCarrito = carrito;
    }
} 