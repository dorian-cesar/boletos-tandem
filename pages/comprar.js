import axios from "axios";
import Layout from "components/Layout";
import Boleto from "components/Boleto";
import BusquedaServicio from 'components/BusquedaServicio';
import Image from "next/image";
import { useEffect, useState, forwardRef, useRef } from "react";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import getConfig from "next/config";
import dayjs from "dayjs";
import DatePicker, { registerLocale } from "react-datepicker";
import Link from "next/link";
import { useRouter } from "next/router";
import Check from "../components/Check";
import Rut from "rutjs";
import Loader from "../components/Loader";
import Head from "next/head";
import Input from "../components/Input";
import { ToastContainer, toast } from "react-toastify";
const { publicRuntimeConfig } = getConfig();
import es from "date-fns/locale/es";
import { ObtenerParrillaServicioDTO } from "./dto/ParrillaDTO";
import { BuscarPlanillaVerticalDTO } from "./dto/MapaAsientosDTO";
import { PasajeConvenioDTO } from "./dto/PasajesDTO";
import { LiberarAsientoDTO, TomaAsientoDTO } from "./dto/TomaAsientoDTO";
import { AsientoDTO } from "./dto/AsientoDTO";

registerLocale("es", es);

const ASIENTO_LIBRE = 'libre';
const ASIENTO_LIBRE_MASCOTA = 'pet-free';
const MAXIMO_COMPRA_ASIENTO = 4;
const STAGE_INICIAL = 0;
const ASIENTO_TIPO_MASCOTA = 'pet';
const ASIENTO_TIPO_ASOCIADO = 'asociado';
const ASIENTO_OCUPADO = 'ocupado';

const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <input type="text" className="fecha-input form-control" onClick={ onClick } ref={ ref } value={ value } />
));

const isSame = (array1, array2) => array1.length === array2.length && array1.every((value, index) => value === array2[index]);

const stages = [
    {
        name: "Selección viaje IDA",
        kind: "pasajes_1",
    },
    {
        name: "Selección viaje VUELTA",
        kind: "pasajes_2",
    },
    {
        name: "Pago",
        kind: "pago",
    },
    {
        name: "Confirmación",
        kind: "confirmacion",
    },
];

export default function Home(props) {
    const ciudades = props.ciudades;

    const router = useRouter();
    const payment_form = useRef(null);
    const [payment, setPayment] = useState({});
    const [modalMab, setModalMab] = useState(false);
    const [mascota_allowed, setMascota] = useState(false);
    const [origen, setOrigen] = useState(router.query.origen);
    const [parrilla, setParrilla] = useState([]);
    const [loadingParrilla, setLoadingParrilla] = useState(true);
    const [destinos, setDestinos] = useState([]);
    const [destino, setDestino] = useState(router.query.destino != "null" ? router.query.destino : null);
    const [asientosIda, setAsientosIda] = useState([]);
    const [asientosVuelta, setAsientosVuelta] = useState([]);
    const [carro, setCarro] = useState({
        clientes_ida: [],
        pasaje_ida: null,
        clientes_vuelta: [],
        pasaje_vuelta: null,
        datos: { tipoRut: "rut" },
    });
    const [convenioFields, setConvenioFields] = useState({});
    const [stage, setStage] = useState(0);
    const [convenioSelected, setConvenioSelected] = useState(null);
    const [convenio, setConvenio] = useState(null);
    const [convenioActive, setConvenioActive] = useState(null);
    const [filter_tipo, setFilterTipo] = useState([]);
    const [filter_horas, setFilterHoras] = useState([]);
    const [openPane, setOpenPane] = useState(false);
    const [sort, setSort] = useState(null);
    const [startDate, setStartDate] = useState(dayjs(router.query.startDate).isValid() ? dayjs(router.query.startDate).toDate(): null);
    const [endDate, setEndDate] = useState(dayjs(router.query.endDate).isValid() ? dayjs(router.query.endDate).toDate() : null);

    async function getConvenio() {
        try {
            const convenio_response = await axios.post("/api/convenio", {
                idConvenio: convenioSelected,
            });
            setConvenio(convenio_response.data);
            setConvenioFields({});
        } catch ({ message }) {
            console.error(`Error al obtener convenio [${ message }]`);
        }
    };

    async function getDestinos() {
        try {
            const destinos = await axios.post("/api/destinos", {
                id_ciudad: origen,
            });
            setDestinos(destinos.data);
        } catch ({ message }) {
            console.error(`Error al obtener destinos [${ message }]`);
        }
    };

    async function searchParrilla(in_stage) {
        try {
            const stage_active = in_stage ?? stage;
            setLoadingParrilla(true);
            const parrilla = await axios.post("/api/parrilla", new ObtenerParrillaServicioDTO(stage_active, origen, destino, startDate, endDate));
            setParrilla(parrilla.data.map((p, index) => {
                return {
                    ...p,
                    id: index + 1
                }
            }));
            setLoadingParrilla(false);   
        } catch ({ message }) {
            console.error(`Error al obtener parrilla [${ message }]`)
        }
    };
    
    function isValidStart(date) {
        try {
            return (
                dayjs(date).isAfter(dayjs().subtract(1, "day")) &&
                dayjs(date).isBefore(dayjs().add(props.dias, "day"))
            );
        } catch ({ message }) {
            console.error(`Error al validar fecha de inicio [${ message }]`)
            return false;
        }
    };

    function isValidAfter(date) {
        try {
            return (
                dayjs(date).isAfter(dayjs(startDate).subtract(1, "day")) &&
                dayjs(date).isBefore(dayjs().add(props.dias, "day"))
            );
        } catch({ message }) {
            console.error(`Error al validar fecha de fin [${ message }]`);
        }
    };
    
    async function reloadPane(indexParrilla) {
        try {
            const parrillaTemporal = [...parrilla];
            const parrillaModificada = [...parrilla];
            const { data } = await axios.post('/api/mapa-asientos', 
                new BuscarPlanillaVerticalDTO(parrillaTemporal[indexParrilla], stage, startDate, endDate, parrilla[indexParrilla]));
            parrillaModificada[indexParrilla].loadingAsientos = false;
            parrillaModificada[indexParrilla].asientos1 = data[1];
            if( !!parrillaTemporal[indexParrilla].busPiso2 ) {
                parrillaModificada[indexParrilla].asientos1 = data[2];
            }
            setParrilla(parrillaModificada);
        } catch ({ message }) {
            console.error(`Error al recargar panel [${ message }]`);
        }
    };

    async function setOpenPaneRoot(indexParrilla) {
        try {
            const parrillaTemporal = [...parrilla];
            const parrillaModificada = [...parrilla];
            parrillaTemporal[indexParrilla].loadingAsientos = true;
            setParrilla(parrillaTemporal);
            stage == STAGE_INICIAL ? setAsientosIda([]) : setAsientosVuelta([]);
            setOpenPane(parrilla[indexParrilla].id);
            const { data } = await axios.post('/api/mapa-asientos', 
                new BuscarPlanillaVerticalDTO(parrillaTemporal[indexParrilla], stage, startDate, endDate, parrilla[indexParrilla]));
            parrillaModificada[indexParrilla].loadingAsientos = false;
            parrillaModificada[indexParrilla].asientos1 = data[1];
            if( !!parrillaTemporal[indexParrilla].busPiso2 ) {
                parrillaModificada[indexParrilla].asientos1 = data[2];
            }
            setParrilla(parrillaModificada);
        } catch ({ message }) {
            console.error(`Error al abrir el panel [${ message }]`);
        }
    };

    async function validarConvenio() {
        try {
            const pasajes = [
                ...carro.clientes_ida.map((pasajeIda) => new PasajeConvenioDTO(pasajeIda)),
                ...carro.clientes_vuelta.map((pasajeVuelta) => new PasajeConvenioDTO(pasajeVuelta))
            ]
    
            const { data } = await axios.post("/api/validar-convenio", {
                convenio: convenioSelected,
                fields: convenioFields,
                pasajes: pasajes,
            });
    
            if ( data.mensaje == "OK" && Number(data.descuento) > 0 ) {
                setConvenioActive(data);
            }   
        } catch ({ message }) {
            console.error(`Error al validar convenio [${ message }]`)
        }
    };

    function validarMaximoAsientos(asientos) {
        if( asientos.length >= MAXIMO_COMPRA_ASIENTO ) {
            toast.warn(`Máximo ${ MAXIMO_COMPRA_ASIENTO } pasajes`, {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false
            });
            return false;
        }
        return true;
    }

    async function servicioTomarAsiento(parrillaServicio, asiento, piso, asientosTemporal, isMascota = false) {
        try {
            const { data } = await axios.post('/api/tomar-asiento', new TomaAsientoDTO(parrillaServicio, startDate, endDate, asiento, piso, stage));
            const reserva = data;           
            if( reserva.estadoReserva ) {
                if( isMascota ) setModalMab(true);
                asientosTemporal.push(new AsientoDTO(reserva, parrillaServicio, asiento, piso))
                stage == STAGE_INICIAL ? setAsientosIda(asientosTemporal) : setAsientosVuelta(asientosTemporal);
                return asientosTemporal;
            }
        } catch ({ message }) {
            throw new Error(`Error al reservar asociado/mascota [${ message }]`);
        }
    }

    async function servicioLiberarAsiento(parrillaServicio, asiento, piso, codigoReserva) {
        try {
            const { data } = await axios.post('/api/liberar-asiento', new LiberarAsientoDTO(parrillaServicio, startDate, endDate, asiento, piso, stage, codigoReserva))
        } catch ({ message }) {
            throw new Error(`Error al liberar asiento [${ message }]`);
        }
    }
    
    async function tomarAsiento(asiento, viaje, indexParrilla, piso) {
        try {
            let asientosTemporal = stage == STAGE_INICIAL ? [...asientosIda] : [...asientosVuelta];
            const asientoSeleccionado = asientosTemporal.find((asientoBusqueda) => asiento.asiento == asientoBusqueda.asiento);

            if( asiento.estado == ASIENTO_LIBRE || asiento.estado == ASIENTO_LIBRE_MASCOTA ) {
                if( !validarMaximoAsientos ) return;
                asientosTemporal = await servicioTomarAsiento(parrilla[indexParrilla], asiento.asiento, piso, asientosTemporal);

                if( asiento.tipo == ASIENTO_TIPO_ASOCIADO || asiento.tipo == ASIENTO_TIPO_MASCOTA ) {
                    asientosTemporal = await servicioTomarAsiento(parrilla[indexParrilla], asiento.asientoAsociado, piso, asientosTemporal, true);
                }

                await reloadPane(indexParrilla);
                return;
            }

            if( asiento.estado == ASIENTO_OCUPADO && asientoSeleccionado ) {
                await servicioLiberarAsiento(parrilla[indexParrilla], asiento.asiento, asientoSeleccionado.codigoReserva);
                
                if( asiento.tipo == ASIENTO_TIPO_ASOCIADO || asiento.tipo == ASIENTO_TIPO_MASCOTA ) {
                    await servicioLiberarAsiento(parrilla[indexParrilla], asiento.asientoAsociado, piso, asientoSeleccionado.codigoReserva);
                }

                await reloadPane(indexParrilla);
                asientosTemporal = asientosTemporal.filter((asientoBusqueda) => asientoBusqueda.asiento != asiento.asiento);
                if( asiento.tipo == ASIENTO_TIPO_ASOCIADO || asiento.tipo == ASIENTO_TIPO_MASCOTA ) {
                    asientosTemporal = asientosTemporal.filter(({ asiento }) => asiento != asiento.asientoAsociado);
                }

                stage == STAGE_INICIAL ? setAsientosIda(asientosTemporal) : setAsientosVuelta(asientosTemporal);
            }
        } catch ({ message }) {
            console.error(`Error al tomar asiento [${ message }]`);
        }
    };

    function getTotal() {
        const ida = getSubtotal(carro.clientes_ida);
        const vuelta = getSubtotal(carro.clientes_vuelta);
        return Number(ida) + Number(vuelta);
    };

    function getSubtotal(clientes, clean) {
        return clientes.reduce((valorAcumulado, { tarifa, origen, asiento, piso }) => {
            const precio = !clean && convenioActive ? 
                obtenerPagoConvenioActivo(origen, asiento, piso) :
                Number(tarifa.replace(/[^\d.-]/g, ""));
            valorAcumulado = Number(valorAcumulado) + precio;
            return valorAcumulado;
        }, 0);
    };

    function obtenerPagoConvenioActivo(origen, asiento, piso) {
        return Number(convenioActive.listaBoleto.find((boleto) => 
            boleto.origen == origen && 
            boleto.asiento == asiento && 
            boleto.piso == piso
        ));
    }

    function toggleTipo(tipo) {
        let listaTipoTemporal = [...filter_tipo];
        if (filter_tipo.includes(tipo)) {
            listaTipoTemporal = filter_tipo.filter((i) => i != tipo);
        } else {
            listaTipoTemporal.push(tipo);
        }
        setFilterTipo(listaTipoTemporal);
    };

    function toggleHoras(horas) {
        let listaHorasTemporal = [...filter_horas];
        if (filter_horas.includes(horas)) {
            listaHorasTemporal = listaHorasTemporal.filter((i) => i != horas);
        } else {
            listaHorasTemporal.push(horas);
        }
        setFilterHoras(listaHorasTemporal);
    };

    const openPasajero = (k, tipo) => {
        let carro_temp = { ...carro };
        if (tipo == "ida") {
            carro_temp.clientes_ida = carro_temp.clientes_ida.map((i) => {
                i.open = false;
                return i;
            });
            carro_temp.clientes_ida[k].open = true;
        } else {
            carro_temp.clientes_vuelta = carro_temp.clientes_vuelta.map((i) => {
                i.open = false;
                return i;
            });
            carro_temp.clientes_vuelta[k].open = true;
        }
        setCarro(carro_temp);
    };
    const setDataPasaje = (e, k, tipo) => {
        let carro_temp = { ...carro };
        let value = e.target.value;
        console.log(e.target.name);
        if (e.target.name == "rut") {
            if (value.length > 2) {
                let rut = new Rut(value);
                value = new Rut(rut.getCleanRut().replace("-", "")).getNiceRut(
                    true
                );
            }
        }
        if (tipo == "ida") {
            carro_temp.clientes_ida[k].pasajero[e.target.name] = value;
        } else {
            carro_temp.clientes_vuelta[k].pasajero[e.target.name] = value;
        }
        setCarro(carro_temp);
    };
    const setDataComprador = (e, k, tipo) => {
        let carro_temp = { ...carro };
        let value = e.target.value;
        console.log(e.target.name);
        if (e.target.name == "rut") {
            if (value.length > 2) {
                let rut = new Rut(value);
                value = new Rut(rut.getCleanRut().replace("-", "")).getNiceRut(
                    true
                );
            }
        }

        carro_temp.datos[e.target.name] = value;

        setCarro(carro_temp);
    };
    const convenioField = (e) => {
        let convenioFieldsTemp = { ...convenioFields };
        convenioFieldsTemp[e.target.name] = e.target.value;
        setConvenioFields(convenioFieldsTemp);
    };
    const setPasaje = (pasaje) => {
        let carro_temp = { ...carro };
        if (stage == STAGE_INICIAL) {
            carro_temp.clientes_ida = asientosIda.map((i, k) => {
                return {
                    idServicio: pasaje.idServicio,
                    fechaServicio: pasaje.fechaServicio,
                    fechaSalida: pasaje.fechaSalida,
                    fechaLlegada: pasaje.fechaLlegada,
                    integrador: pasaje.integrador,
                    horaSalida: pasaje.horaSalida,
                    empresa: pasaje.empresa,
                    bus: i.piso == 1 ? pasaje.busPiso1 : pasaje.busPiso2,
                    origen: pasaje.idTerminalOrigen,
                    destino: pasaje.idTerminalDestino,
                    codigoReserva: 1,
                    clase: pasaje.idClaseBusPisoUno,
                    tarifa:
                        i.piso == 1
                            ? pasaje.tarifaPrimerPisoInternet
                            : pasaje.tarifaSegundoPisoInternet,
                    servicio:
                        i.piso == 1
                            ? pasaje.servicioPrimerPiso
                            : pasaje.servicioSegundoPiso,
                    piso: i.piso,
                    pet: i.pet,
                    asiento: i.asiento,
                    open: k == 0 ? true : false,
                    extras: pasaje,
                    pasajero: {
                        tipoRut: "rut",
                        nacionalidad: "CHL",
                        errors: [],
                    },
                };
            });
            carro_temp.pasaje_ida = pasaje;
            setStage(1);
            setCarro(carro_temp);

            setOpenPane(null);

            searchParrilla(1);
        }
        if (stage == 1) {
            carro_temp.clientes_vuelta = asientosVuelta.map((i, k) => {
                return {
                    idServicio: pasaje.idServicio,
                    fechaServicio: pasaje.fechaServicio,
                    fechaSalida: pasaje.fechaSalida,
                    fechaLlegada: pasaje.fechaLlegada,
                    integrador: pasaje.integrador,
                    horaSalida: pasaje.horaSalida,
                    empresa: pasaje.empresa,
                    bus: i.piso == 1 ? pasaje.busPiso1 : pasaje.busPiso2,
                    origen: pasaje.idTerminalOrigen,
                    destino: pasaje.idTerminalDestino,
                    codigoReserva: 1,
                    clase: pasaje.idClaseBusPisoUno,
                    piso: i.piso,
                    pet: i.pet,
                    asiento: i.asiento,
                    tarifa:
                        i.piso == 1
                            ? pasaje.tarifaPrimerPisoInternet
                            : pasaje.tarifaSegundoPisoInternet,
                    servicio:
                        i.piso == 1
                            ? pasaje.servicioPrimerPiso
                            : pasaje.servicioSegundoPiso,
                    open: k == 0 ? true : false,
                    extras: pasaje,
                    pasajero: {
                        tipoRut: "rut",
                        nacionalidad: "CHL",
                        errors: [],
                    },
                };
            });
            carro_temp.pasaje_vuelta = pasaje;
            setStage(2);
            setCarro(carro_temp);
        }
    };
    const tipos_servicio = parrilla.reduce((a, b) => {
        if (!a.includes(b.servicioPrimerPiso) && b.servicioPrimerPiso != "") {
            a.push(b.servicioPrimerPiso);
        }
        if (!a.includes(b.servicioSegundoPiso) && b.servicioSegundoPiso != "") {
            a.push(b.servicioSegundoPiso);
        }
        return a;
    }, []);
    const isPaymentValid = () => {
        let valid = true;
        let ida = carro.clientes_ida.reduce((a, b, k) => {
            if (!isValidPasajero(b.pasajero, k, "ida")) {
                a = false;
            }
            return a;
        }, true);
        let vuelta = carro.clientes_vuelta.reduce((a, b, k) => {
            if (!isValidPasajero(b.pasajero, k, "vuelta")) {
                a = false;
            }
            return a;
        }, true);
        console.log("vakud", ida, vuelta);
        if (!ida || !vuelta) {
            valid = false;
        }
        return valid;
    };
    const isValidPasajero = (p, k, dir) => {
        let valid = true;
        let errors = [...p.errors];
        let carro_temp = { ...carro };
        let error_temp = [];
        let pasaj = p;
        console.log("CART", carro_temp[`clientes_${dir}`][k]);
        if (carro_temp[`clientes_${dir}`][k].pet) {
            pasaj = carro_temp[`clientes_${dir}`][k - 1].pasajero;
        }
        if (!pasaj.nombre || pasaj.nombre == "") {
            valid = false;
        } else {
        }
        if (!pasaj.apellido || pasaj.apellido == "") {
            valid = false;
        }
        if (!pasaj.email || pasaj.email == "") {
            valid = false;
        } else {
            if (
                !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                    pasaj.email
                )
            ) {
                error_temp.push("email");
            }
        }
        if (!pasaj.email_2 || pasaj.email_2 == "") {
            valid = false;
        } else {
            if (pasaj.email != pasaj.email_2) {
                error_temp.push("email_2");
            }
        }

        if (!pasaj.rut || pasaj.rut == "") {
            valid = false;
        } else {
            let rut = new Rut(pasaj.rut);
            if (!rut.isValid) {
                valid = false;

                error_temp.push("rut");
            }
        }
        if (!isSame(error_temp, errors)) {
            carro_temp[`clientes_${dir}`][k].pasajero.errors = error_temp;
            setCarro(carro_temp);
        }

        return valid;
    };
    const sendToPayment = async () => {
        if (!isPaymentValid()) {
            return;
        }
        let pasajes = [
            ...carro.clientes_ida.map((i, k) => {
                let pasajero = i.pasajero;
                if (i.pet) {
                    pasajero = carro.clientes_ida[k - 1];
                }
                return {
                    servicio: i.idServicio,
                    fechaServicio: i.extras.fechaServicio,
                    fechaPasada: i.extras.fechaLlegada,
                    fechaLlegada: i.extras.fechaLlegada,
                    horaSalida: i.horaSalida,
                    horaLlegada: i.extras.horaLlegada,
                    origen: i.origen,
                    destino: i.destino,
                    codigoReserva: "1",
                    descuento: 0,
                    empresa: i.extras.empresa,
                    clase: i.clase,
                    bus: i.bus,
                    integrador: 1000,
                    monto: i.tarifa.replace(",", ""),
                    precio: convenioActive
                        ? Number(
                              convenioActive.listaBoleto.find(
                                  (ii) =>
                                      ii.origen == i.origen &&
                                      ii.asiento == i.asiento &&
                                      ii.piso == i.piso
                              ).pago
                          )
                        : i.tarifa.replace(",", ""),
                    idaVuelta: false,
                    piso: i.piso,
                    asiento: i.asiento,
                    datoConvenio: convenioActive
                        ? convenioActive.listaAtributo[0].valor
                        : "",
                    convenio: convenioActive ? convenioActive.idConvenio : "",
                    pasajero: {
                        comunaDestino: "14000001",
                        comunaOrigen: "14000001",
                        documento: pasajero.rut
                            .replace(".", "")
                            .replace(".", ""),
                        email: pasajero.email,
                        nacionalidad: pasajero.nacionalidad,
                        nombre: pasajero.nombre,
                        apellido: pasajero.apellido,
                        telefono: pasajero.telefono,
                        telefonoEmergencia: "955555555",
                        tipoDocumento: "R",
                    },
                    tipoServicio: null,
                    asientoAsociado: null,
                };
            }),
            ...carro.clientes_vuelta.map((i) => {
                let pasajero = i.pasajero;
                if (i.pet) {
                    pasajero = carro.clientes_vuelta[k - 1];
                }
                return {
                    servicio: i.idServicio,
                    fechaServicio: i.extras.fechaServicio,
                    fechaPasada: i.extras.fechaLlegada,
                    fechaLlegada: i.extras.fechaLlegada,
                    horaSalida: i.horaSalida,
                    horaLlegada: i.extras.horaLlegada,
                    origen: i.origen,
                    destino: i.destino,
                    codigoReserva: "1",
                    descuento: 0,
                    empresa: i.extras.empresa,
                    clase: i.clase,
                    bus: i.bus,
                    integrador: 1000,
                    monto: i.tarifa,
                    precio: convenioActive
                        ? Number(
                              convenioActive.listaBoleto.find(
                                  (ii) =>
                                      ii.origen == i.origen &&
                                      ii.asiento == i.asiento &&
                                      ii.piso == i.piso
                              ).pago
                          )
                        : i.tarifa,
                    idaVuelta: false,
                    piso: i.piso,
                    asiento: i.asiento,
                    datoConvenio: convenioActive
                        ? convenioActive.listaAtributo[0].valor
                        : "",
                    convenio: convenioActive ? convenioActive.idConvenio : "",
                    pasajero: {
                        comunaDestino: "14000001",
                        comunaOrigen: "14000001",
                        documento: pasajero.rut
                            .replace(".", "")
                            .replace(".", ""),
                        email: pasajero.email,
                        nacionalidad: pasajero.nacionalidad,
                        nombre: pasajero.nombre,
                        apellido: pasajero.apellido,
                        telefono: "955555555",
                        telefonoEmergencia: "955555555",
                        tipoDocumento: "R",
                    },
                    tipoServicio: null,
                    asientoAsociado: null,
                };
            }),
        ];
        console.log(carro);
        let data = {
            email: carro.datos.email,
            rut: carro.datos.rut.replace(".", "").replace(".", ""),
            medioDePago: "WBPAY",
            montoTotal: getTotal(),
            idSistema: 7,
            listaCarrito: pasajes,
        };
        let response = await axios.post("/api/guardar-carro", data);
        if (!response.data.error) {
            setPayment({
                ...payment,
                url: response.data.url,
                token: response.data.token,
            });
        }
    };

    const stages_active = endDate ? stages : stages.filter((i) => i.kind != "pasajes_2");

    useEffect(() => {
        (async () => await getConvenio())();
    }, [convenioSelected]);

    useEffect(() => {
        (async () => await getDestinos())();
    }, [origen]);

    useEffect(() => {
        payment_form.current?.submit();
    }, [payment]);

    useEffect(() => {
        console.log(parrilla);
    }, [parrilla]);
    
    useEffect(() => {
        setDestinos(props.destinos);
        searchParrilla();
    }, []);

    useEffect(() => {
        if (endDate && dayjs(startDate).isAfter(dayjs(endDate))) {
            console.log("endf");
            setEndDate(dayjs(startDate).toDate());
        }
    }, [startDate]);

    return (
        <Layout>
            <Head>
                <title>PullmanBus | Compra Boleto</title>
            </Head>
            <div className="pasajes">
                <BusquedaServicio origenes={ props.ciudades } dias={ props.dias }/>
            </div>
            <div className="pasajes-compra py-5">
                <div className="container">
                    <div className="d-flex flex-row justify-content-around">
                        {stages
                            .filter(
                                (i, k) =>
                                    endDate ||
                                    (!endDate && i.kind != "pasajes_2")
                            )
                            .map((i, k) => {
                                return (
                                    <div
                                        className={
                                            "seleccion text-center " +
                                            (k == stage ? "active" : "")
                                        }
                                    >
                                        <div className="numeros">
                                            <div className="numero">
                                                {k + 1}
                                            </div>
                                        </div>
                                        <h3>{i.name}</h3>
                                    </div>
                                );
                            })}
                    </div>
                    {stages_active[stage].kind == "pasajes_1" ||
                    stages_active[stage].kind == "pasajes_2" ? (
                        <div className="row">
                            <div className="col-12 col-md-3" key={stage + "it"}>
                                <div className="bloque-filtro">
                                    <h2>Filtrar por:</h2>
                                    <div className="w-100 mb-4">
                                        <span>Tipo de servicio</span>
                                        {tipos_servicio
                                            .filter((i) => i)
                                            .map((i, k) => {
                                                return (
                                                    <div className="custom-control custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            className="custom-control-input"
                                                            id={"tipoCheck" + k}
                                                            onClick={() =>
                                                                toggleTipo(i)
                                                            }
                                                            value={i}
                                                            checked={filter_tipo.includes(
                                                                i
                                                            )}
                                                        />
                                                        <label
                                                            className="custom-control-label"
                                                            for={
                                                                "tipoCheck" + k
                                                            }
                                                        >
                                                            &nbsp;{i}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                    <div className="w-100 mb-4">
                                        <span>Horarios</span>

                                        <div className="custom-control custom-checkbox">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                id={"horaCheck1"}
                                                checked={filter_horas.includes(
                                                    "6-12"
                                                )}
                                                onClick={() =>
                                                    toggleHoras("6-12")
                                                }
                                            />
                                            <label
                                                className="custom-control-label"
                                                for={"horaCheck1"}
                                            >
                                                &nbsp;6:00 AM a 11:59 AM
                                            </label>
                                        </div>
                                        <div className="custom-control custom-checkbox">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                id={"horaCheck2"}
                                                checked={filter_horas.includes(
                                                    "12-20"
                                                )}
                                                onClick={() =>
                                                    toggleHoras("12-20")
                                                }
                                            />
                                            <label
                                                className="custom-control-label"
                                                for={"horaCheck2"}
                                            >
                                                &nbsp;12 PM a 19:59 PM
                                            </label>
                                        </div>
                                        <div className="custom-control custom-checkbox">
                                            <input
                                                type="checkbox"
                                                className="custom-control-input"
                                                id={"horaCheck3"}
                                                checked={filter_horas.includes(
                                                    "20-6"
                                                )}
                                                onClick={() =>
                                                    toggleHoras("20-6")
                                                }
                                            />
                                            <label
                                                className="custom-control-label"
                                                for={"horaCheck3"}
                                            >
                                                &nbsp;20:00 PM en adelante
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-md-9">
                                <div className="bloque-header">
                                    <div className="row">
                                        <div
                                            className="col-4 text-center"
                                            onClick={() =>
                                                setSort(
                                                    sort == "precio-up"
                                                        ? "precio-down"
                                                        : "precio-up"
                                                )
                                            }
                                        >
                                            <span>
                                                <img
                                                    className="mr-2"
                                                    src="img/icon-peso.svg"
                                                    alt=""
                                                />
                                                Rango de Precio &nbsp;
                                                {sort == "precio-up" ? (
                                                    <img
                                                        src="img/icon-flecha-arriba.svg"
                                                        alt=""
                                                    />
                                                ) : (
                                                    ""
                                                )}
                                                {sort == "precio-down" ? (
                                                    <img
                                                        src="img/icon-flecha-arriba.svg"
                                                        style={{
                                                            transform:
                                                                "rotate(180deg)",
                                                        }}
                                                        alt=""
                                                    />
                                                ) : (
                                                    ""
                                                )}
                                            </span>
                                        </div>
                                        <div
                                            className="col-4 text-center"
                                            onClick={() =>
                                                setSort(
                                                    sort == "hora-up"
                                                        ? "hora-down"
                                                        : "hora-up"
                                                )
                                            }
                                        >
                                            <span>
                                                <img
                                                    className="mr-2"
                                                    src="img/icon-hora.svg"
                                                    alt=""
                                                />
                                                Horario de salida &nbsp;
                                                {sort == "hora-up" ? (
                                                    <img
                                                        src="img/icon-flecha-arriba.svg"
                                                        alt=""
                                                    />
                                                ) : (
                                                    ""
                                                )}
                                                {sort == "hora-down" ? (
                                                    <img
                                                        src="img/icon-flecha-arriba.svg"
                                                        style={{
                                                            transform:
                                                                "rotate(180deg)",
                                                        }}
                                                        alt=""
                                                    />
                                                ) : (
                                                    ""
                                                )}
                                            </span>
                                        </div>
                                        <div className="col-4">
                                            <div
                                                className="d-flex w-100 justify-content-end"
                                                onClick={() =>
                                                    setMascota(!mascota_allowed)
                                                }
                                            >
                                                <img
                                                    className="mr-2"
                                                    src="img/icon-mascota-blanco.svg"
                                                />
                                                <span>Mascota a bordo</span>
                                                <label
                                                    className={
                                                        "switch " +
                                                        (mascota_allowed
                                                            ? "checked"
                                                            : "")
                                                    }
                                                >
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {loadingParrilla ? (
                                    <Loader />
                                ) : (
                                    <>
                                        {parrilla.length > 0 ? (
                                            <>
                                                {" "}
                                                {parrilla
                                                    .sort((a, b) => {
                                                        if (!sort) {
                                                            return 1;
                                                        } else {
                                                            if (
                                                                sort ==
                                                                "precio-up"
                                                            ) {
                                                                return (
                                                                    a.tarifaPrimerPisoInternet -
                                                                    b.tarifaPrimerPisoInternet
                                                                );
                                                            } else if (
                                                                sort ==
                                                                "precio-down"
                                                            ) {
                                                                return (
                                                                    b.tarifaPrimerPisoInternet -
                                                                    a.tarifaPrimerPisoInternet
                                                                );
                                                            } else if (
                                                                sort ==
                                                                "hora-up"
                                                            ) {
                                                                return (
                                                                    Number(
                                                                        a.horaSalida.replace(
                                                                            ":",
                                                                            ""
                                                                        )
                                                                    ) -
                                                                    Number(
                                                                        b.horaSalida.replace(
                                                                            ":",
                                                                            ""
                                                                        )
                                                                    )
                                                                );
                                                            } else {
                                                                return (
                                                                    Number(
                                                                        b.horaSalida.replace(
                                                                            ":",
                                                                            ""
                                                                        )
                                                                    ) -
                                                                    Number(
                                                                        a.horaSalida.replace(
                                                                            ":",
                                                                            ""
                                                                        )
                                                                    )
                                                                );
                                                            }
                                                        }
                                                    })
                                                    .map((i, k) => {
                                                        if (
                                                            filter_tipo.length >
                                                                0 &&
                                                            !filter_tipo.includes(
                                                                i.servicioPrimerPiso
                                                            ) &&
                                                            !filter_tipo.includes(
                                                                i.servicioSegundoPiso
                                                            )
                                                        ) {
                                                            return;
                                                        }
                                                        if (
                                                            mascota_allowed &&
                                                            i.mascota == 0
                                                        ) {
                                                            return;
                                                        }
                                                        if (
                                                            filter_horas.length >
                                                            0
                                                        ) {
                                                            let isTime =
                                                                filter_horas.reduce(
                                                                    (a, b) => {
                                                                        if (
                                                                            !a
                                                                        ) {
                                                                            let hora_filtro =
                                                                                b.split(
                                                                                    "-"
                                                                                );
                                                                            let hora_viaje =
                                                                                i.horaSalida.split(
                                                                                    "-"
                                                                                );
                                                                            if (
                                                                                hora_viaje[0] <=
                                                                                    hora_filtro[1] &&
                                                                                hora_viaje[0] >=
                                                                                    hora_filtro[0]
                                                                            ) {
                                                                                a = true;
                                                                            }
                                                                        }
                                                                        return a;
                                                                    },
                                                                    false
                                                                );
                                                            if (!isTime) {
                                                                return;
                                                            }
                                                        }
                                                        return (
                                                            <Boleto
                                                                {...i}
                                                                openPane={
                                                                    openPane
                                                                }
                                                                asientos_selected={
                                                                    stage == STAGE_INICIAL
                                                                        ? asientosIda
                                                                        : asientosVuelta
                                                                }
                                                                stage={stage}
                                                                setPasaje={
                                                                    setPasaje
                                                                }
                                                                tomarAsiento={
                                                                    tomarAsiento
                                                                }
                                                                setOpenPane={
                                                                    setOpenPaneRoot
                                                                }
                                                                k={k}
                                                            />
                                                        );
                                                    })}
                                            </>
                                        ) : (
                                            <>
                                                <h5 className="p-2">
                                                    Lo sentimos, no existen
                                                    resultados para su búsqueda
                                                </h5>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        ""
                    )}
                    {stages_active[stage].kind == "pago" ? (
                        <div className="pago">
                            <div className="container">
                                <div className="bloque bg-white pasajeros">
                                    <h2>Registro de pasajeros</h2>
                                    <div
                                        className="bloque "
                                        style={{ backgroundColor: "#F6F8FB" }}
                                    >
                                        <div className="top-asiento">
                                            <div className="row">
                                                <div className="col-12 col-md-6">
                                                    <div className="row">
                                                        <div className="col-2">
                                                            <strong>IDA</strong>
                                                        </div>
                                                        <div className="col-1">
                                                            <img
                                                                src="img/icon-ida-viaje.svg"
                                                                alt=""
                                                            />
                                                        </div>
                                                        <div className="col-9">
                                                            <div className="w-100 mb-3">
                                                                <span>
                                                                    <strong className="d-inline">
                                                                        {
                                                                            carro
                                                                                .pasaje_ida
                                                                                .terminalSalida
                                                                        }
                                                                    </strong>
                                                                </span>{" "}
                                                                <br />
                                                                <span>
                                                                    {
                                                                        carro
                                                                            .pasaje_ida
                                                                            .horaSalida
                                                                    }{" "}
                                                                    /{" "}
                                                                    {
                                                                        carro
                                                                            .pasaje_ida
                                                                            .fechaSalida
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="w-100">
                                                                <span>
                                                                    <strong className="d-inline">
                                                                        {
                                                                            carro
                                                                                .pasaje_ida
                                                                                .terminaLlegada
                                                                        }
                                                                    </strong>{" "}
                                                                </span>{" "}
                                                                <br />
                                                                <span>
                                                                    {
                                                                        carro
                                                                            .pasaje_ida
                                                                            .horaLlegada
                                                                    }{" "}
                                                                    /{" "}
                                                                    {
                                                                        carro
                                                                            .pasaje_ida
                                                                            .fechaLlegada
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {carro.clientes_ida.map((i, k) => {
                                        console.log(i);
                                        return (
                                            <div
                                                className={
                                                    "d-flex flex-col bloque-pasajero " +
                                                    (i.open ? "active" : "")
                                                }
                                            >
                                                <div
                                                    className={
                                                        "header-pasajero "
                                                    }
                                                    onClick={() => {
                                                        !i.pet
                                                            ? openPasajero(
                                                                  k,
                                                                  "ida"
                                                              )
                                                            : "";
                                                    }}
                                                >
                                                    <h5>
                                                        Pasajero {k + 1} -
                                                        Asiento {i.asiento} -
                                                        Piso {i.piso}
                                                    </h5>
                                                    {isValidPasajero(
                                                        i.pasajero,
                                                        k,
                                                        "ida"
                                                    ) ? (
                                                        <Check />
                                                    ) : (
                                                        ""
                                                    )}
                                                    {i.pet ? (
                                                        <img
                                                            style={{
                                                                width: "30px",
                                                                marginLeft:
                                                                    "auto",
                                                            }}
                                                            src="/img/icon-patita.svg"
                                                        />
                                                    ) : (
                                                        ""
                                                    )}
                                                </div>
                                                <div className="content-pasajero d-flex justify-content-center">
                                                    <div className="col-12 col-md-8">
                                                        <div className="row">
                                                            <div className="col-12 col-md-6">
                                                                <div className="grupo-campos">
                                                                    <label className="label-input">
                                                                        Nombres
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Ej: Juan Andrés"
                                                                        value={
                                                                            i
                                                                                .pasajero[
                                                                                "nombre"
                                                                            ]
                                                                        }
                                                                        className="form-control"
                                                                        name="nombre"
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setDataPasaje(
                                                                                e,
                                                                                k,
                                                                                "ida"
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-12 col-md-6">
                                                                <div className="grupo-campos">
                                                                    <label className="label-input">
                                                                        Apellidos
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Ej: Espinoza Arcos"
                                                                        value={
                                                                            i
                                                                                .pasajero[
                                                                                "apellido"
                                                                            ]
                                                                        }
                                                                        className="form-control"
                                                                        name="apellido"
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setDataPasaje(
                                                                                e,
                                                                                k,
                                                                                "ida"
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-12 col-md-6">
                                                                <div className="row">
                                                                    <div className="col">
                                                                        <label className="contenedor">
                                                                            Rut
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={
                                                                                    i
                                                                                        .pasajero[
                                                                                        "tipoRut"
                                                                                    ] ==
                                                                                    "rut"
                                                                                        ? "true"
                                                                                        : ""
                                                                                }
                                                                                value={
                                                                                    "rut"
                                                                                }
                                                                                name="tipoRut"
                                                                                onChange={(
                                                                                    e
                                                                                ) => {
                                                                                    console.log(
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                        e
                                                                                            .target
                                                                                            .name
                                                                                    );
                                                                                    setDataPasaje(
                                                                                        e,
                                                                                        k,
                                                                                        "ida"
                                                                                    );
                                                                                }}
                                                                            />
                                                                            <span className="checkmark"></span>
                                                                        </label>
                                                                    </div>
                                                                    <div className="col">
                                                                        <label className="contenedor">
                                                                            Pasaporte
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={
                                                                                    i
                                                                                        .pasajero[
                                                                                        "tipoRut"
                                                                                    ] ==
                                                                                    "pasaporte"
                                                                                        ? "true"
                                                                                        : ""
                                                                                }
                                                                                value={
                                                                                    "pasaporte"
                                                                                }
                                                                                name="tipoRut"
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    setDataPasaje(
                                                                                        e,
                                                                                        k,
                                                                                        "ida"
                                                                                    )
                                                                                }
                                                                            />
                                                                            <span className="checkmark"></span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div className="grupo-campos">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Ej: 111111111"
                                                                        value={
                                                                            i
                                                                                .pasajero[
                                                                                "rut"
                                                                            ]
                                                                        }
                                                                        className={
                                                                            "form-control " +
                                                                            (i.pasajero.errors.includes(
                                                                                "rut"
                                                                            )
                                                                                ? "is-invalid"
                                                                                : "")
                                                                        }
                                                                        name="rut"
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setDataPasaje(
                                                                                e,
                                                                                k,
                                                                                "ida"
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-12 col-md-6">
                                                                <div className="grupo-campos">
                                                                    <label className="label-input input-op">
                                                                        Nacionalidad
                                                                    </label>
                                                                    <select
                                                                        name="nacionalidad"
                                                                        id="cars"
                                                                        className="form-control seleccion"
                                                                        value={
                                                                            i
                                                                                .pasajero[
                                                                                "nacionalidad"
                                                                            ]
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setDataPasaje(
                                                                                e,
                                                                                k,
                                                                                "ida"
                                                                            )
                                                                        }
                                                                    >
                                                                        {props.nacionalidades.map(
                                                                            (
                                                                                ii
                                                                            ) => (
                                                                                <option
                                                                                    value={
                                                                                        ii.valor
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        ii.descripcion
                                                                                    }
                                                                                </option>
                                                                            )
                                                                        )}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="col-12 col-md-6">
                                                                <div className="grupo-campos">
                                                                    <label className="label-input">
                                                                        E-mail
                                                                    </label>
                                                                    <input
                                                                        type="email"
                                                                        name="email"
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setDataPasaje(
                                                                                e,
                                                                                k,
                                                                                "ida"
                                                                            )
                                                                        }
                                                                        value={
                                                                            i
                                                                                .pasajero[
                                                                                "email"
                                                                            ]
                                                                        }
                                                                        placeholder="Ingresa tu email de contacto"
                                                                        className={
                                                                            "form-control " +
                                                                            (i.pasajero.errors.includes(
                                                                                "email"
                                                                            )
                                                                                ? "is-invalid"
                                                                                : "")
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-12 col-md-6">
                                                                <div className="grupo-campos">
                                                                    <label className="label-input">
                                                                        Confirma
                                                                        E-mail
                                                                    </label>
                                                                    <input
                                                                        type="email"
                                                                        name="email_2"
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setDataPasaje(
                                                                                e,
                                                                                k,
                                                                                "ida"
                                                                            )
                                                                        }
                                                                        value={
                                                                            i
                                                                                .pasajero[
                                                                                "email_2"
                                                                            ]
                                                                        }
                                                                        placeholder="Confirma tu e-mail"
                                                                        className={
                                                                            "form-control " +
                                                                            (i.pasajero.errors.includes(
                                                                                "email_2"
                                                                            )
                                                                                ? "is-invalid"
                                                                                : "")
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* <div className="col-12 col-md-6 offset-md-6">
                                    <div className="custom-control custom-checkbox">
                                        <input type="checkbox" className="custom-control-input" id="customCheck1" />
                                        <label className="custom-control-label" for="customCheck1">Guardar en mi perfil de registro de pasajeros</label>
                                      </div> 
                       </div> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {carro.pasaje_vuelta ? (
                                        <>
                                            <div
                                                className="bloque "
                                                style={{
                                                    backgroundColor: "#F6F8FB",
                                                }}
                                            >
                                                <div className="top-asiento">
                                                    <div className="row">
                                                        <div className="col-12 col-md-6">
                                                            <div className="row">
                                                                <div className="col-2">
                                                                    <strong>
                                                                        VUELTA
                                                                    </strong>
                                                                </div>
                                                                <div className="col-1">
                                                                    <img
                                                                        src="img/icon-ida-viaje.svg"
                                                                        alt=""
                                                                    />
                                                                </div>
                                                                <div className="col-9">
                                                                    <div className="w-100 mb-3">
                                                                        <span>
                                                                            <strong className="d-inline">
                                                                                Arica
                                                                            </strong>{" "}
                                                                            /{" "}
                                                                            {
                                                                                carro
                                                                                    .pasaje_vuelta
                                                                                    .terminalSalida
                                                                            }
                                                                        </span>{" "}
                                                                        <br />
                                                                        <span>
                                                                            {
                                                                                carro
                                                                                    .pasaje_vuelta
                                                                                    .horaSalida
                                                                            }{" "}
                                                                            /{" "}
                                                                            {
                                                                                carro
                                                                                    .pasaje_vuelta
                                                                                    .fechaSalida
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="w-100">
                                                                        <span>
                                                                            <strong className="d-inline">
                                                                                Santiago
                                                                            </strong>{" "}
                                                                            /{" "}
                                                                            {
                                                                                carro
                                                                                    .pasaje_vuelta
                                                                                    .terminalLLegada
                                                                            }
                                                                        </span>{" "}
                                                                        <br />
                                                                        <span>
                                                                            {
                                                                                carro
                                                                                    .pasaje_vuelta
                                                                                    .horaLlegada
                                                                            }{" "}
                                                                            /{" "}
                                                                            {
                                                                                carro
                                                                                    .pasaje_vuelta
                                                                                    .fechaLlegada
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {carro.clientes_vuelta.map(
                                                (i, k) => {
                                                    return (
                                                        <div
                                                            className={
                                                                "d-flex flex-col bloque-pasajero " +
                                                                (i.open
                                                                    ? "active"
                                                                    : "")
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    "header-pasajero "
                                                                }
                                                                onClick={() => {
                                                                    i.pet
                                                                        ? openPasajero(
                                                                              k,
                                                                              "vuelta"
                                                                          )
                                                                        : "";
                                                                }}
                                                            >
                                                                <h5>
                                                                    Pasajero{" "}
                                                                    {k + 1} -
                                                                    Asiento{" "}
                                                                    {i.asiento}{" "}
                                                                    - Piso{" "}
                                                                    {i.piso}{" "}
                                                                </h5>
                                                                {isValidPasajero(
                                                                    i.pasajero,
                                                                    k,
                                                                    "vuelta"
                                                                ) ? (
                                                                    <Check />
                                                                ) : (
                                                                    ""
                                                                )}{" "}
                                                                {i.pet ? (
                                                                    <img
                                                                        style={{
                                                                            width: "30px",
                                                                            marginLeft:
                                                                                "auto",
                                                                        }}
                                                                        src="/img/icon-patita.svg"
                                                                    />
                                                                ) : (
                                                                    ""
                                                                )}
                                                            </div>
                                                            <div className="content-pasajero d-flex justify-content-center">
                                                                <div className="col-12 col-md-8">
                                                                    <div className="row">
                                                                        <div className="col-12 col-md-6">
                                                                            <div className="grupo-campos">
                                                                                <label className="label-input">
                                                                                    Nombres
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="Ej: Juan Andrés"
                                                                                    value={
                                                                                        i
                                                                                            .pasajero[
                                                                                            "nombre"
                                                                                        ]
                                                                                    }
                                                                                    className="form-control"
                                                                                    name="nombre"
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        setDataPasaje(
                                                                                            e,
                                                                                            k,
                                                                                            "vuelta"
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-12 col-md-6">
                                                                            <div className="grupo-campos">
                                                                                <label className="label-input">
                                                                                    Apellidos
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="Ej: Espinoza Arcos"
                                                                                    value={
                                                                                        i
                                                                                            .pasajero[
                                                                                            "apellido"
                                                                                        ]
                                                                                    }
                                                                                    className="form-control"
                                                                                    name="apellido"
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        setDataPasaje(
                                                                                            e,
                                                                                            k,
                                                                                            "vuelta"
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-12 col-md-6">
                                                                            <div className="row">
                                                                                <div className="col">
                                                                                    <label className="contenedor">
                                                                                        Rut
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={
                                                                                                i
                                                                                                    .pasajero[
                                                                                                    "tipoRut"
                                                                                                ] ==
                                                                                                "rut"
                                                                                                    ? "checked"
                                                                                                    : ""
                                                                                            }
                                                                                            value={
                                                                                                "rut"
                                                                                            }
                                                                                            name="tipoRut"
                                                                                            onChange={(
                                                                                                e
                                                                                            ) =>
                                                                                                setDataPasaje(
                                                                                                    e,
                                                                                                    k,
                                                                                                    "vuelta"
                                                                                                )
                                                                                            }
                                                                                        />
                                                                                        <span className="checkmark"></span>
                                                                                    </label>
                                                                                </div>
                                                                                <div className="col">
                                                                                    <label className="contenedor">
                                                                                        Pasaporte
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={
                                                                                                i
                                                                                                    .pasajero[
                                                                                                    "tipoRut"
                                                                                                ] ==
                                                                                                "pasaporte"
                                                                                                    ? "checked"
                                                                                                    : ""
                                                                                            }
                                                                                            value={
                                                                                                "pasaporte"
                                                                                            }
                                                                                            name="tipoRut"
                                                                                            onChange={(
                                                                                                e
                                                                                            ) =>
                                                                                                setDataPasaje(
                                                                                                    e,
                                                                                                    k,
                                                                                                    "vuelta"
                                                                                                )
                                                                                            }
                                                                                        />
                                                                                        <span className="checkmark"></span>
                                                                                    </label>
                                                                                </div>
                                                                            </div>
                                                                            <div className="grupo-campos">
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="Ej: 111111111"
                                                                                    value={
                                                                                        i
                                                                                            .pasajero[
                                                                                            "rut"
                                                                                        ]
                                                                                    }
                                                                                    className={
                                                                                        "form-control " +
                                                                                        (i.pasajero.errors.includes(
                                                                                            "rut"
                                                                                        )
                                                                                            ? "is-invalid"
                                                                                            : "")
                                                                                    }
                                                                                    name="rut"
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        setDataPasaje(
                                                                                            e,
                                                                                            k,
                                                                                            "vuelta"
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-12 col-md-6">
                                                                            <div className="grupo-campos">
                                                                                <label className="label-input input-op">
                                                                                    Nacionalidad
                                                                                </label>
                                                                                <select
                                                                                    name="nacionalidad"
                                                                                    id="cars"
                                                                                    className="form-control seleccion"
                                                                                    value={
                                                                                        i
                                                                                            .pasajero[
                                                                                            "nacionalidad"
                                                                                        ]
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        setDataPasaje(
                                                                                            e,
                                                                                            k,
                                                                                            "vuelta"
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    {props.nacionalidades.map(
                                                                                        (
                                                                                            ii
                                                                                        ) => (
                                                                                            <option
                                                                                                value={
                                                                                                    ii.valor
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    ii.descripcion
                                                                                                }
                                                                                            </option>
                                                                                        )
                                                                                    )}
                                                                                </select>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-12 col-md-6">
                                                                            <div className="grupo-campos">
                                                                                <label className="label-input">
                                                                                    E-mail
                                                                                </label>
                                                                                <input
                                                                                    type="email"
                                                                                    name="email"
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        setDataPasaje(
                                                                                            e,
                                                                                            k,
                                                                                            "vuelta"
                                                                                        )
                                                                                    }
                                                                                    value={
                                                                                        i
                                                                                            .pasajero[
                                                                                            "email"
                                                                                        ]
                                                                                    }
                                                                                    placeholder="Ingresa tu email de contacto"
                                                                                    className={
                                                                                        "form-control " +
                                                                                        (i.pasajero.errors.includes(
                                                                                            "email"
                                                                                        )
                                                                                            ? "is-invalid"
                                                                                            : "")
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-12 col-md-6">
                                                                            <div className="grupo-campos">
                                                                                <label className="label-input">
                                                                                    Confirma
                                                                                    E-mail
                                                                                </label>
                                                                                <input
                                                                                    type="email"
                                                                                    name="email_2"
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        setDataPasaje(
                                                                                            e,
                                                                                            k,
                                                                                            "vuelta"
                                                                                        )
                                                                                    }
                                                                                    value={
                                                                                        i
                                                                                            .pasajero[
                                                                                            "email_2"
                                                                                        ]
                                                                                    }
                                                                                    placeholder="Confirma tu e-mail"
                                                                                    className={
                                                                                        "form-control " +
                                                                                        (i.pasajero.errors.includes(
                                                                                            "email_2"
                                                                                        )
                                                                                            ? "is-invalid"
                                                                                            : "")
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        {/* <div className="col-12 col-md-6 offset-md-6">
                                  <div className="custom-control custom-checkbox">
                                      <input type="checkbox" className="custom-control-input" id="customCheck1" />
                                      <label className="custom-control-label" for="customCheck1">Guardar en mi perfil de registro de pasajeros</label>
                                    </div> 
                     </div> */}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </>
                                    ) : (
                                        ""
                                    )}
                                </div>
                                <div className="bloque comprador  bg-white">
                                    <h2>Datos comprador</h2>

                                    <div className="row mt-5">
                                        <div className="col-12 col-md-6">
                                            <div className="grupo-campos">
                                                <label className="label-input">
                                                    Nombres
                                                </label>
                                                <input
                                                    type="text"
                                                    name="nombre"
                                                    placeholder="Ej: Juan Andrés"
                                                    className="form-control"
                                                    onChange={(e) =>
                                                        setDataComprador(e)
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <div className="grupo-campos">
                                                <label className="label-input">
                                                    Apellidos
                                                </label>
                                                <input
                                                    type="text"
                                                    name="apellido"
                                                    placeholder="Ej: Espinoza Arcos"
                                                    className="form-control"
                                                    onChange={(e) =>
                                                        setDataComprador(e)
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <div className="row">
                                                <div className="col">
                                                    <label className="contenedor">
                                                        Rut
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                carro.datos[
                                                                    "tipoRut"
                                                                ] == "rut"
                                                                    ? "checked"
                                                                    : ""
                                                            }
                                                            value="rut"
                                                            name="tipoRut"
                                                            onChange={(e) =>
                                                                setDataComprador(
                                                                    e
                                                                )
                                                            }
                                                        />
                                                        <span className="checkmark"></span>
                                                    </label>
                                                </div>
                                                <div className="col">
                                                    <label className="contenedor">
                                                        Pasaporte
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                carro.datos[
                                                                    "tipoRut"
                                                                ] == "pasaporte"
                                                                    ? "checked"
                                                                    : ""
                                                            }
                                                            value="pasaporte"
                                                            name="tipoRut"
                                                            onChange={(e) =>
                                                                setDataComprador(
                                                                    e
                                                                )
                                                            }
                                                        />
                                                        <span className="checkmark"></span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="grupo-campos">
                                                <input
                                                    type="text"
                                                    name="rut"
                                                    placeholder="Ej: 111111111"
                                                    className="form-control"
                                                    onChange={(e) =>
                                                        setDataComprador(e)
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <div className="grupo-campos">
                                                <label className="label-input">
                                                    E-mail
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    placeholder="Ingresa tu email de contacto"
                                                    className="form-control"
                                                    onChange={(e) =>
                                                        setDataComprador(e)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex">
                                    {/*<div className='col-12 col-md-6 m-1 '>
                    <div className='bloque  bg-white h-100'>
                   
                       
                         <h2>3.Adicionales</h2>
                        <div className="w-100 mb-3 mt-5">
                          <a href="" className="btn btn-morado">Seguros de viajes y equipajes</a>
                        </div>
                        <div className="w-100 mb-3">
                          <a href="" className="btn btn-amarillo">Transporte privado Delfos</a>
                        </div>
                        <div className="w-100 mb-3">
                          <a href="" className="btn btn-celeste">Transporte privado Cabify</a>
                </div>
            
                    </div>
                  
                  </div>*/}
                                    <div className="col-12 col-md-12 m-1">
                                        <div className="bloque  bg-white">
                                            <h2>Convenios</h2>
                                            <div className="grupo-campos mt-5">
                                                <label className="label-input input-op">
                                                    Convenios
                                                </label>
                                                <select
                                                    name="convenios"
                                                    id="cars"
                                                    className="form-control seleccion"
                                                    value={convenioSelected}
                                                    onChange={(e) =>
                                                        setConvenioSelected(
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Seleccione Convenio
                                                    </option>
                                                    {props.convenios.map(
                                                        (i) => (
                                                            <option
                                                                value={
                                                                    i.idConvenio
                                                                }
                                                            >
                                                                {i.descripcion}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                            {convenio ? (
                                                <>
                                                    {convenio.map((i) => (
                                                        <div className="grupo-campos mt-5">
                                                            <label>
                                                                {i.tipo}
                                                            </label>
                                                            <input
                                                                onChange={(e) =>
                                                                    convenioField(
                                                                        e
                                                                    )
                                                                }
                                                                value={
                                                                    convenioFields[
                                                                        i.tipo
                                                                    ]
                                                                }
                                                                type={
                                                                    i.tipoInput
                                                                }
                                                                name={i.tipo}
                                                                className="form-control"
                                                            />
                                                        </div>
                                                    ))}
                                                    <a
                                                        className="btn"
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            validarConvenio();
                                                        }}
                                                    >
                                                        Validar Convenio
                                                    </a>
                                                </>
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="bloque comprador  bg-white">
                                    <h2>Resumen de compra</h2>
                                    <div className="row">
                                        <div className="col-12 col-md-7">
                                            {carro.clientes_ida ? (
                                                <div className="row cantidad-asiento mb-5">
                                                    <div className="col-8">
                                                        <div className="row">
                                                            <div className="col-12">
                                                                <strong>
                                                                    IDA
                                                                </strong>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-8">
                                                                <h5>
                                                                    Cantidad de
                                                                    asientos
                                                                </h5>
                                                            </div>
                                                            <div className="col-4"></div>
                                                        </div>
                                                        {function () {
                                                            let servicios =
                                                                carro.clientes_ida.reduce(
                                                                    (a, b) => {
                                                                        if (
                                                                            !a[
                                                                                b
                                                                                    .servicio
                                                                            ]
                                                                        ) {
                                                                            a[
                                                                                b.servicio
                                                                            ] =
                                                                                [];
                                                                        }
                                                                        a[
                                                                            b
                                                                                .servicio
                                                                        ].push(
                                                                            b
                                                                        );
                                                                        return a;
                                                                    },
                                                                    {}
                                                                );
                                                            return Object.keys(
                                                                servicios
                                                            ).map((i) => (
                                                                <>
                                                                    <div className="row">
                                                                        <div className="col-8">
                                                                            <h4>
                                                                                {
                                                                                    servicios[
                                                                                        i
                                                                                    ]
                                                                                        .length
                                                                                }
                                                                                X
                                                                                boleto{" "}
                                                                                {
                                                                                    i
                                                                                }
                                                                            </h4>
                                                                        </div>
                                                                        <div className="col-4 d-flex justify-content-end">
                                                                            <h3>
                                                                                $
                                                                                {getSubtotal(
                                                                                    servicios[
                                                                                        i
                                                                                    ]
                                                                                ).toLocaleString(
                                                                                    "es"
                                                                                )}
                                                                            </h3>
                                                                        </div>
                                                                    </div>
                                                                    <div className="row">
                                                                        <div className="col-8">
                                                                            <p>
                                                                                Precio
                                                                                Normal
                                                                            </p>
                                                                        </div>
                                                                        <div className="col-4 d-flex justify-content-end">
                                                                            <h4 className="tachado">
                                                                                $
                                                                                {(
                                                                                    Math.round(
                                                                                        (getSubtotal(
                                                                                            servicios[
                                                                                                i
                                                                                            ],
                                                                                            true
                                                                                        ) *
                                                                                            1.12) /
                                                                                            100
                                                                                    ) *
                                                                                    100
                                                                                ).toLocaleString(
                                                                                    "es"
                                                                                )}
                                                                            </h4>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ));
                                                        }.call(this)}

                                                        {/* <div className="row">
                            <div className="col-8">
                              <span>Adicionales “Nombre Adicional”</span>
                            </div>
                            <div className="col-4 d-flex justify-content-end">
                               <span>$0</span>
                            </div>
                        </div>*/}
                                                    </div>
                                                </div>
                                            ) : (
                                                ""
                                            )}

                                            {carro.clientes_vuelta ? (
                                                <div className="row cantidad-asiento mb-5">
                                                    <div className="col-8">
                                                        <div className="row">
                                                            <div className="col-12">
                                                                <strong>
                                                                    VUELTA
                                                                </strong>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-8">
                                                                <h5>
                                                                    Cantidad de
                                                                    asientos
                                                                </h5>
                                                            </div>
                                                            <div className="col-4"></div>
                                                        </div>
                                                        {function () {
                                                            console.log(carro);
                                                            let servicios =
                                                                carro.clientes_vuelta.reduce(
                                                                    (a, b) => {
                                                                        if (
                                                                            !a[
                                                                                b
                                                                                    .servicio
                                                                            ]
                                                                        ) {
                                                                            a[
                                                                                b.servicio
                                                                            ] =
                                                                                [];
                                                                        }
                                                                        a[
                                                                            b
                                                                                .servicio
                                                                        ].push(
                                                                            b
                                                                        );
                                                                        return a;
                                                                    },
                                                                    {}
                                                                );
                                                            return Object.keys(
                                                                servicios
                                                            ).map((i) => (
                                                                <>
                                                                    <div className="row">
                                                                        <div className="col-8">
                                                                            <h4>
                                                                                {
                                                                                    servicios[
                                                                                        i
                                                                                    ]
                                                                                        .length
                                                                                }
                                                                                X
                                                                                boleto{" "}
                                                                                {
                                                                                    i
                                                                                }
                                                                            </h4>
                                                                        </div>
                                                                        <div className="col-4 d-flex justify-content-end">
                                                                            <h3>
                                                                                $
                                                                                {getSubtotal(
                                                                                    servicios[
                                                                                        i
                                                                                    ]
                                                                                ).toLocaleString(
                                                                                    "es"
                                                                                )}
                                                                            </h3>
                                                                        </div>
                                                                    </div>
                                                                    {
                                                                        <div className="row">
                                                                            <div className="col-8">
                                                                                <p>
                                                                                    Precio
                                                                                    Normal
                                                                                </p>
                                                                            </div>
                                                                            <div className="col-4 d-flex justify-content-end">
                                                                                <h4 className="tachado">
                                                                                    $
                                                                                    {(
                                                                                        Math.round(
                                                                                            (getSubtotal(
                                                                                                servicios[
                                                                                                    i
                                                                                                ],
                                                                                                true
                                                                                            ) *
                                                                                                1.12) /
                                                                                                100
                                                                                        ) *
                                                                                        100
                                                                                    ).toLocaleString(
                                                                                        "es"
                                                                                    )}
                                                                                </h4>
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                </>
                                                            ));
                                                        }.call(this)}

                                                        {/* <div className="row">
                            <div className="col-8">
                              <span>Adicionales “Nombre Adicional”</span>
                            </div>
                            <div className="col-4 d-flex justify-content-end">
                               <span>$0</span>
                            </div>
                        </div>*/}
                                                    </div>
                                                </div>
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className="col-12 col-md-5 total-pagar">
                                            <div className="row">
                                                <div className="col-6 d-flex align-items-center">
                                                    <h3>Total a pagar:</h3>
                                                </div>
                                                <div className="col-6 d-flex justify-content-end">
                                                    <h2>
                                                        $
                                                        {getTotal().toLocaleString(
                                                            "es"
                                                        )}
                                                    </h2>
                                                </div>
                                            </div>
                                            <div className="row my-5">
                                                <div className="col-12">
                                                    {props.mediosDePago.map(
                                                        (i) => (
                                                            <img
                                                                src={
                                                                    "data:image/png;base64," +
                                                                    i.imagen
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </div>
                                                <div className="col-12 p-2">
                                                    <label className="d-flex align-items-baseline mb-3 mt-3">
                                                        <input
                                                            type="checkbox"
                                                            className="mr-2"
                                                        />
                                                        <small>
                                                            He leido los{" "}
                                                            <a
                                                                href="/terminos"
                                                                target="_blank"
                                                            >
                                                                Terminos y
                                                                Condiciones
                                                            </a>{" "}
                                                            de la compra
                                                        </small>
                                                    </label>
                                                    <label className="d-flex align-items-baseline">
                                                        <input
                                                            type="checkbox"
                                                            className="mr-2"
                                                        />
                                                        <small>
                                                            Me gustaria recibir
                                                            noticias,
                                                            actualizaciones o
                                                            información de
                                                            Pullman Bus
                                                        </small>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-12">
                                                    <a
                                                        href="#"
                                                        className={
                                                            "btn " +
                                                            (!isPaymentValid()
                                                                ? "disabled"
                                                                : "")
                                                        }
                                                        disabled={
                                                            !isPaymentValid()
                                                        }
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            sendToPayment();
                                                        }}
                                                    >
                                                        Pagar
                                                    </a>

                                                    <form
                                                        ref={payment_form}
                                                        style={{
                                                            display: "none",
                                                        }}
                                                        method="POST"
                                                        action={payment.url}
                                                    >
                                                        <input
                                                            name="TBK_TOKEN"
                                                            value={
                                                                payment.token
                                                            }
                                                        />
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        ""
                    )}
                </div>
            </div>
            {modalMab ? (
                <div className="modal fade show" tabindex="-1" role="dialog">
                    <div
                        className="modal-dialog modal-dialog-centered modal-lg"
                        role="document"
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <b>
                                        Seleccionaste un asiento dentro del
                                        espacio reservado para mascotas abordo
                                    </b>
                                </h5>
                                <button
                                    type="button"
                                    className="close"
                                    data-dismiss="modal"
                                    aria-label="Close"
                                    onClick={() => setModalMab(false)}
                                >
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body d-flex align-items-center">
                                <img
                                    src="/MAB-logo1.png"
                                    className="col-12 col-md-3"
                                />
                                <ul className="p-1 list-style-dot">
                                    <li>
                                        Solo podrán viajar Perros y Gatos en un
                                        Canil que no exceda los 60 cm de largo,
                                        34 cm de alto y 38,5 cm de ancho.
                                    </li>
                                    <li>
                                        Solo puede viajar una mascota por
                                        pasajero.
                                    </li>
                                    <li>
                                        {" "}
                                        Debe firmar una "Declaración Jurada de
                                        Tenencia Responsable" antes del viaje
                                        que se enviará junto el pasaje.
                                    </li>
                                </ul>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setModalMab(false)}
                                >
                                    Continuar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                ""
            )}
            <ToastContainer />
        </Layout>
    );
}

export const getServerSideProps = withIronSessionSsr(async function ({
    req,
    res,
    query,
}) {
    let ciudades = await axios.get(
        publicRuntimeConfig.site_url + "/api/ciudades"
    );
    let destinos = await axios.post(
        publicRuntimeConfig.site_url + "/api/destinos",
        { id_ciudad: query.origen }
    );
    let dias = await axios.get(publicRuntimeConfig.site_url + "/api/dias");
    let nacionalidades = await axios.get(
        publicRuntimeConfig.site_url + "/api/nacionalidades"
    );
    let convenios = await axios.get(
        publicRuntimeConfig.site_url + "/api/convenios"
    );
    let mediosDePago = await axios.get(
        publicRuntimeConfig.site_url + "/api/medios-de-pago"
    );

    return {
        props: {
            ciudades: ciudades.data,
            dias: dias.data,
            nacionalidades: nacionalidades.data,
            convenios: convenios.data,
            mediosDePago: mediosDePago.data,
            destinos: destinos.data,
        },
    };
},
sessionOptions);
