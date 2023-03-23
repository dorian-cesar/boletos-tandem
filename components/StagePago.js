import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Rut from "rutjs";

import Check from "../components/Check";
import { PasajeConvenioDTO } from "pages/dto/PasajesDTO";
import { GuardarCarroDTO, PasajePagoDTO } from "../pages/dto/PasajesDTO";

const isSame = (array1, array2) => array1.length === array2.length && array1.every((value, index) => value === array2[index]);

const StagePago = (props) => {

    const { carro, nacionalidades, convenios, mediosDePago, setCarro } = props;

    const [convenioSelected, setConvenioSelected] = useState(null);
    const [convenio, setConvenio] = useState(null);
    const [convenioActive, setConvenioActive] = useState(null);
    const [convenioFields, setConvenioFields] = useState({});
    const [payment, setPayment] = useState({});

    const payment_form = useRef(null);

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

    function openPasajero(indexCliente, tipo) {
        try {
            let carroTemporal = { ...carro };
            const tipoCliente = tipo == 'ida' ? 'clientes_ida' : 'clientes_vuelta';
            carroTemporal[tipoCliente] = carro[tipoCliente].map((carroMapped) => {
                carroMapped.open = false;
                return carroMapped;
            });
            carroTemporal[tipoCliente][indexCliente].open = true;
            setCarro(carroTemporal);
        } catch (error) {
            console.error(`Error al abrir detalle pasajero [${ message }]`);
        }
    };

    function validarFormatoRut(name, value) {
        try {
            if ( name.trim() == 'rut' && value.length > 2 ) {
                let rut = new Rut(value);
                value = new Rut(rut.getCleanRut().replace("-", "")).getNiceRut(true);
            }
            return value;
        } catch ({ message }) {
            console.error(`Error al validar formato de rut [${ message }]`);
        }
    }

    function setDataPasaje({ name, value }, indexCliente, tipo) {
        try {
            let carroTemporal = { ...carro };
            const tipoCliente = tipo == 'ida' ? 'clientes_ida' : 'clientes_vuelta';
            value = validarFormatoRut(name, value);
            carroTemporal[tipoCliente][indexCliente].pasajero[name] = value;
            setCarro(carroTemporal);    
        } catch ({ message }) {
            console.error(`Error al agregar información al pasajero [${ message }]`);
        }
    };

    function setDataComprador({ name, value }) {
        try {
            let carro_temp = { ...carro };
            value = validarFormatoRut(name, value);
            carro_temp.datos[name] = value;
            setCarro(carro_temp);
        } catch ({ message }) {
            console.error(`Error al agregar informacion del comprador [${ message }]`);
        }
    };

    function convenioField({ name, value }) {
        try {
            let convenioFieldsTemp = { ...convenioFields };
            convenioFieldsTemp[name] = value;
            setConvenioFields(convenioFieldsTemp);
        } catch ({ message }) {
            console.error(`Error al asignar convenio [${ message }]`);
        }
    };

    function obtenerPagoConvenioActivo(origen, asiento, piso) {
        try {
            return Number(convenioActive.listaBoleto.find((boleto) => 
                boleto.origen == origen && 
                boleto.asiento == asiento && 
                boleto.piso == piso
            ));
        } catch ({ message }) {
            console.error(`Error al obtener pago convenio [${ message }]`);
        }
    }

    function getSubtotal(clientes, clean) {
        try {
            return clientes.reduce((valorAcumulado, { tarifa, origen, asiento, piso }) => {
                const precio = !clean && convenioActive ? 
                    obtenerPagoConvenioActivo(origen, asiento, piso) :
                    Number(tarifa.replace(/[^\d.-]/g, ""));
                valorAcumulado = Number(valorAcumulado) + precio;
                return valorAcumulado;
            }, 0);
        } catch ({ message }) {
            console.error(`Error al obtener el sub total [${ message }]`);
        }
    };

    function getTotal() {
        try {
            const ida = getSubtotal(carro.clientes_ida);
            const vuelta = getSubtotal(carro.clientes_vuelta);
            return Number(ida) + Number(vuelta);
        } catch ({ message }) {
            console.error(`Error al obtener el total [${ message }]`);
        }
    };

    function isPaymentValid() {
        try {
            let isValid = true;
    
            const pasajerosIda = carro.clientes_ida.reduce((valorIncial, pasajeroRecorrido, indexPasajero) => {
                if ( !isValidPasajero(pasajeroRecorrido.pasajero, indexPasajero, 'ida') ) {
                    valorIncial = false;
                }
                return valorIncial;
            }, true);
    
            const pasajerosVuelta = carro.clientes_vuelta.reduce((valorIncial, pasajeroRecorrido, indexPasajero) => {
                if ( !isValidPasajero(pasajeroRecorrido.pasajero, indexPasajero, 'vuelta') ) {
                    valorIncial = false;
                }
                return valorIncial;
            }, true);
    
            if ( !pasajerosIda || !pasajerosVuelta ) {
                isValid = false;
            }
    
            return isValid;    
        } catch ({ message }) {
            console.error(`Error al validar el pago [${ message }]`);
        }
    };

    function isValidPasajero(pasajero, indexPasajero, direccionRecorrido) {
        try {
            let isValid = true;
            let errors = [...pasajero.errors];
            let carroTemporal = { ...carro };
            let errorTemporal = [];

            if ( !pasajero.nombre || pasajero.nombre == "" ) {
                isValid = false;
            }

            if ( !pasajero.apellido || pasajero.apellido == "" ) {
                isValid = false;
            }

            if ( !pasajero.email || pasajero.email == "" ) {
                isValid = false;
            } else {
                if ( !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(pasajero.email) ) {
                    errorTemporal.push("email");
                }
            }

            if ( !pasajero.email_2 || pasajero.email_2 == "" ) {
                isValid = false;
            } else {
                if ( pasajero.email != pasajero.email_2 ) {
                    errorTemporal.push("email_2");
                }
            }
    
            if (!pasajero.rut || pasajero.rut == "") {
                isValid = false;
            } else {
                const rutValidacion = new Rut(pasajero.rut);
                if ( !rutValidacion.isValid ) {
                    isValid = false;
                    errorTemporal.push("rut");
                }
            }

            if (!isSame(errorTemporal, errors)) {
                carroTemporal[`clientes_${direccionRecorrido}`][indexPasajero].pasajero.errors = errorTemporal;
                setCarro(carroTemporal);
            }
    
            return isValid;
        } catch ({ message }) {
            console.error(`Error al validar pasajero [${ message }]`);
        }
    };

    async function sendToPayment() {
        try {
            if ( !isPaymentValid() )  return;
            let pasajes = [
                ...carro.clientes_ida.map((clientesIdaMapped, clientesIdaIndex) => {
                    const pasajero = clientesIdaMapped.pet ? carro.clientes_ida[clientesIdaIndex - 1] : clientesIdaMapped.pasajero;
                    const convenioActivo = convenioActive ? convenioActive.idConvenio : '';
                    const datoConvenio = convenioActive ? convenioActive.listaAtributo[0].valor : '';
                    const precioConvenio = convenioActive ? 
                    Number(convenioActive.listaBoleto.find((boleto) => 
                        boleto.origen == clientesIdaMapped.origen && 
                        boleto.asiento == clientesIdaMapped.asiento && 
                        boleto.piso == clientesIdaMapped.piso).pago) : clientesIdaMapped.tarifa.replace(",", "");
                    return new PasajePagoDTO(clientesIdaMapped, pasajero, clientesIdaMapped.extras, convenioActivo, precioConvenio, datoConvenio);
                }),
                ...carro.clientes_vuelta.map((clientesVueltaMapped, clientesVueltaIndex) => {
                    const pasajero = clientesVueltaMapped.pet ? carro.clientes_ida[clientesVueltaIndex - 1] : clientesVueltaMapped.pasajero;
                    const convenioActivo = convenioActive ? convenioActive.idConvenio : '';
                    const datoConvenio = convenioActive ? convenioActive.listaAtributo[0].valor : '';
                    const precioConvenio = convenioActive ? 
                    Number(convenioActive.listaBoleto.find((boleto) => 
                        boleto.origen == clientesVueltaMapped.origen && 
                        boleto.asiento == clientesVueltaMapped.asiento && 
                        boleto.piso == clientesVueltaMapped.piso).pago) : clientesVueltaMapped.tarifa.replace(",", "");
                    return new PasajePagoDTO(clientesVueltaMapped, pasajero, clientesVueltaMapped.extras, convenioActivo, precioConvenio, datoConvenio);
                }),
            ];

            const { email, rut } = carro.datos;

            const response = await axios.post("/api/guardar-carro", new GuardarCarroDTO(email, rut, getTotal(), pasajes));

            if ( !response.data.error ) {
                setPayment({
                    ...payment,
                    url: response.data.url,
                    token: response.data.token,
                });
            }
        } catch ({ message }) {
            console.error(`Error al enviar pago [${ message }]`);   
        }
    };

    useEffect(() => {
        (async () => await getConvenio())();
    }, [convenioSelected]);

    useEffect(() => {
        if( payment.url ) {
            payment_form.current?.submit();
        }
    }, [payment]);

    return (
        (
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

                        {carro.clientes_ida.map((i, indexCliente) => {
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
                                                      indexCliente,
                                                      "ida"
                                                  )
                                                : "";
                                        }}
                                    >
                                        <h5>
                                            Pasajero {indexCliente + 1} -
                                            Asiento {i.asiento.asiento} -
                                            Piso {i.piso}
                                        </h5>
                                        {isValidPasajero(
                                            i.pasajero,
                                            indexCliente,
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
                                                                    e.target,
                                                                    indexCliente,
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
                                                                    e.target,
                                                                    indexCliente,
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
                                                                        setDataPasaje(
                                                                            e.target,
                                                                            indexCliente,
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
                                                                            e.target,
                                                                            indexCliente,
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
                                                                    e.target,
                                                                    indexCliente,
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
                                                                    e.target,
                                                                    indexCliente,
                                                                    "ida"
                                                                )
                                                            }
                                                        >
                                                            {nacionalidades.map(
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
                                                                    e.target,
                                                                    indexCliente,
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
                                                                    e.target,
                                                                    indexCliente,
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
                                    (i, indexCliente) => {
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
                                                                  indexCliente,
                                                                  "vuelta"
                                                              )
                                                            : "";
                                                    }}
                                                >
                                                    <h5>
                                                        Pasajero{" "}
                                                        {indexCliente + 1} -
                                                        Asiento{" "}
                                                        {i.asiento}{" "}
                                                        - Piso{" "}
                                                        {i.piso}{" "}
                                                    </h5>
                                                    {isValidPasajero(
                                                        i.pasajero,
                                                        indexCliente,
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
                                                                                e.target,
                                                                                indexCliente,
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
                                                                                e.target,
                                                                                indexCliente,
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
                                                                                        e.target,
                                                                                        indexCliente,
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
                                                                                        e.target,
                                                                                        indexCliente,
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
                                                                                e.target,
                                                                                indexCliente,
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
                                                                                e.target,
                                                                                indexCliente,
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
                                                                                e.target,
                                                                                indexCliente,
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
                                                                                e.target,
                                                                                indexCliente,
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
                                            setDataComprador(e.target)
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
                                            setDataComprador(e.target)
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
                                                        e.target
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
                                                        e.target
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
                                            setDataComprador(e.target)
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
                                            setDataComprador(e.target)
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
                                        {convenios.map(
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
                                                            e.target
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
                                        {mediosDePago.map(
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
        )
    )
}

export default StagePago;