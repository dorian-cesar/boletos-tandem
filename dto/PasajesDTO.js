import dayjs from "dayjs";

export class PasajeConvenioDTO {
    constructor(data) {
        this.asiento = data?.asiento || '';
        this.bus = data?.bus || '';
        this.clase = data?.clase || '';
        this.descuento = data?.descuento || '0';
        this.destino = data?.destino || '';
        this.fechaSalida = dayjs(data?.fechaSalida, 'DD/MM/YYYY').format('YYYYMMDD');
        this.horaSalida = data?.departureTime || '';
        this.idServicio = data?.id || '';
        this.origen = data?.origen || '';
        this.pago = data?.tarifa || '';
        this.valor = Math.round(data?.tarifa.replace('.', '') * 1.1);
        this.piso = data?.piso || '';
        this.promocion = data?.promocion || '0';
    }
}

export class PasajeDTO {
    constructor(pasaje, asiento, isOpen = true) {
        this.idServicio = pasaje?.parrilla.id || '';
        this.fechaServicio = pasaje?.parrilla.date || '';
        this.fechaSalida = pasaje?.parrilla.date || '';
        this.fechaLlegada = pasaje?.parrilla.arrivalDate || '';
        this.integrador = pasaje?.parrilla.idParrilla|| 0;
        this.horaSalida = pasaje?.parrilla.departureTime || '';
        this.empresa = pasaje?.parrilla.company || '';
        this.bus = asiento?.piso == 1 ? pasaje?.parrilla.asientos1 : pasaje?.parrilla.asientos2;
        this.origen = pasaje?.parrilla.terminalOrigin || '';
        this.destino = pasaje?.parrilla.terminalDestination || '';
        this.codigoReserva = 1;
        this.clase = pasaje?.parrilla.busTypeDescription|| '';
        this.tarifa = asiento?.piso == 1 ? pasaje?.parrilla.priceFirst : pasaje?.parrilla.priceSecond;
        this.servicio = asiento?.piso == 1 ? pasaje?.thisParrilla.seatLayout.tipo_Asiento_piso_1 : pasaje?.thisParrilla.seatLayout.tipo_Asiento_piso_1; 
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
        this.servicio = pasaje?.id || '';
        this.fechaServicio = extras?.fechaServicio || '';
        this.fechaPasada = extras?.date || '';
        this.fechaLlegada = extras?.arrivalDate || '';
        this.horaSalida = pasaje?.horaSalida || '';
        this.horaLlegada = extras?.horaLlegada || '';
        this.origen = pasaje?.origen || '';
        this.destino = pasaje?.destino || '';
        this.codigoReserva = '1';
        this.descuento = 0;
        this.empresa = extras?.empresa || '';
        this.clase = pasaje?.busTypeDescription || '';
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
        this.codigoCuponera = pasaje.codigoCuponera || '';
    }
}

export class ListaCarritoDTO {
    constructor(servicio, asiento) {
        this.servicio = servicio?.id || '';
        this.fechaServicio = servicio?.date || '';
        // TODO: REVISAR FECHA PASADA EN ALGUN FUTURO
        this.fechaPasada = servicio?.date || '';
        this.fechaLlegada = servicio?.arrivalDate || '';
        this.horaSalida = servicio?.departureTime || '';
        this.horaLlegada = servicio?.arrivalTime || '';
        this.origen = servicio?.terminalOrigin || '';
        this.destino = servicio?.terminalDestination || '';
        this.codigoReserva = '1'
        this.descuento = servicio?.descuento ? servicio.descuento : 0;
        this.empresa = servicio?.company || '';
        this.clase = asiento?.busTypeDescription || '';
        this.bus = servicio?.layout || '';
        this.integrador = servicio?.integrador || 1000;
        this.datoConvenio = servicio?.datoConvenio ? servicio.datoConvenio : '';
        this.convenio = servicio?.convenioActivo ? servicio.convenioActivo : '';
        // this.tipoServicio = null;
        // this.asientoAsociado = null;
        this.pasajeros = [];
    }
}

export class PasajeroListaCarritoDTO {
    constructor(asiento) {
        this.monto = asiento?.valorAsiento.toString() || '0';
        this.precio = asiento?.precio.toString() || asiento?.valorAsiento.toString() || '0';
        this.idaVuelta = asiento?.idaVuelta || false;
        this.piso = asiento?.piso || 1;
        this.asiento = asiento?.asiento || '';
        this.clase = asiento?.busTypeDescription || '';
        this.documento = asiento?.rut || '';
        this.email = asiento?.email || '';
        this.nacionalidad = asiento?.nacionalidad || '';
        this.nombre = asiento?.nombre || '';
        this.apellido = asiento?.apellido || '';
        this.telefono = asiento?.telefono || '';
        this.tipoDocumento = asiento?.tipoDocumento || '';
        this.tipoMascota = asiento?.tipoMascota || false;
        this.relacionAsiento = asiento?.asientoAsociado || "";
        this.descuento = asiento?.descuento || 0;
        this.convenio = asiento?.convenio || "";
        this.datoConvenio = asiento?.datoConvenio || "";
        this.cantidadEquipaje = asiento?.cantidadEquipaje || 0;
    }
}

export class GuardarCarroDTO {
    constructor(email, rut, total, carrito) {
        this.email = email || '';
        this.rut = rut.replace(".", "").replace(".", "") || '';
        this.medioDePago = 'WBPAY';
        this.montoTotal = total;
        this.idSistema = 1;
        this.listaCarrito = carrito;
    }
} 

export class GuardarCarroCuponeraDTO {
    constructor(email, rut, total, carrito) {
        this.email = email || '';
        this.rut = rut.replace(".", "").replace(".", "") || '';
        this.medioDePago = 'WBPAY';
        this.montoTotal = total;
        this.idSistema = 1;
        this.integrador = 1000;
        this.carroCuponera = carrito;
       
    }
} 

export class ValidarUsoCuponeraDTO {
    constructor(origen, destino, fechaServicio, idServicio, codigoCuponera) {
        this.origen = origen || '';
        this.destino = destino || '';
        this.fechaServicio = fechaServicio;
        this.idServicio = idServicio;
        this.codigoCuponera = codigoCuponera;    
    }
} 

export class CanjearCuponeraDTO {
    constructor(email, rut, total, carrito, codigoCuponera) {
        this.email = email || '';
        this.rut = rut.replace(".", "").replace(".", "") || '';
        this.medioDePago = 'WBPAY';
        this.montoTotal = total;
        this.idSistema = 1;
        this.listaCarrito = carrito;
        this.codigoCuponera = codigoCuponera;
    }
} 