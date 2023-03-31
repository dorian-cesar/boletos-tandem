import axios from "axios";
import Layout from "components/Layout";
import { useEffect, useState, forwardRef, useRef } from "react";
import { withIronSessionSsr } from "iron-session/next";
import getConfig from "next/config";
import dayjs from "dayjs";
import DatePicker, { registerLocale } from "react-datepicker";
import { sessionOptions } from "lib/session";
import Link from "next/link";
import Input from "../components/Input";
const { publicRuntimeConfig } = getConfig();
import es from "date-fns/locale/es";
import Loader from "../components/Loader";
import Boleto from "components/Boleto";
registerLocale("es", es);
import { ToastContainer, toast } from "react-toastify";
import Rut from "rutjs";
import Check from "../components/Check";
import Head from "next/head";
import { isValidPasajero } from 'utils/user-pasajero';

const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <input type="text" className="fecha-input form-control" onClick={ onClick } ref={ ref } value={ value }/>
));

const isSame = (array1, array2) => array1.length === array2.length && array1.every((value, index) => value === array2[index]);

export default function CambioBoleto(props) {
	const ciudades = props.ciudades;
	const payment_form = useRef(null);
	const [payment, setPayment] = useState({});
	const [carro, setCarro] = useState({
		clientes_ida: [],
		pasaje_ida: null,
		datos: { tipoRut: "rut" },
	});

	const [stage, setStage] = useState(0);
	const [boleto, setBoleto] = useState(null);
	const [boletoValido, setBoletoValido] = useState(null);
	const [mascota_allowed, setMascota] = useState(false);
	const [origen, setOrigen] = useState(null);
	const [startDate, setStartDate] = useState(dayjs().toDate());
	const [parrilla, setParrilla] = useState([]);
	const [loadingParrilla, setLoadingParrilla] = useState(false);
	const [destinos, setDestinos] = useState([]);
	const [destino, setDestino] = useState(null);
	const [asientosIda, setAsientosIda] = useState([]);
	const [openPane, setOpenPane] = useState(false);
	const [sort, setSort] = useState(null);

	function setDataPasaje({ value, name }, indexCliente){
		let carro_temp = { ...carro };
		if ( name == 'rut' && value.length > 2) {
			let rut = new Rut(value);
			value = new Rut(rut.getCleanRut().replace("-", "")).getNiceRut(true);
		}
		carro_temp.clientes_ida[indexCliente].pasajero[name] = value;
		setCarro(carro_temp);
	};

	async function validarBoleto() {
		const { data } = await axios.post("/api/validar-cambio", { boleto });
		if (data.boleto) {
			setBoletoValido(data);
			setStage(1);
		} else {
			toast.error(data.error, {
				position: "bottom-center",
				autoClose: 5000,
				hideProgressBar: false,
			});
		}
	};
  const getDestinos = async() => {
    if( origen !== null ) {
      let { data } = await axios.post("/api/destinos",{ id_ciudad: origen });
      setDestinos(data);
    }
  }

  useEffect(()=>{
    (async () => await getDestinos())();
  },[origen]);

  const [endDate, setEndDate] = useState(null);
  useEffect(()=>{
    if(endDate && dayjs(startDate).isAfter(dayjs(endDate))){
      setEndDate(dayjs(startDate).toDate())
    }
  },[startDate])
 
  const isValidStart = (date) => {
    return dayjs(date).isAfter(dayjs().subtract(1,'day')) && dayjs(date).isBefore(dayjs().add(props.dias,'day'));
    
  }

  const searchServicios = async () => {
    setLoadingParrilla(true);
    let data = {
      origen: origen,
      destino: destino,
      startDate: dayjs(startDate).format("YYYYMMDD"),
    };

    let parrilla = await axios.post("/api/parrilla", data);
    setParrilla(parrilla.data);
    setLoadingParrilla(false);
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
          monto: i.tarifa,
          precio: i.tarifa,
          idaVuelta: false,
          piso: i.piso,
          asiento: i.asiento,
          datoConvenio: "",
          convenio: "",
          pasajero: {
            comunaDestino: "14000001",
            comunaOrigen: "14000001",
            documento: pasajero.rut.replace(".", "").replace(".", ""),
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
          precio: i.tarifa,
          idaVuelta: false,
          piso: i.piso,
          asiento: i.asiento,
          datoConvenio: "",
          convenio: "",
          pasajero: {
            comunaDestino: "14000001",
            comunaOrigen: "14000001",
            documento: pasajero.rut.replace(".", "").replace(".", ""),
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
    let data = {
      email: carro.datos.email,
      rut: carro.datos.rut.replace(".", "").replace(".", ""),
      medioDePago: "WBPAY",
      montoTotal: getTotal(),
      idSistema: 7,
      listaCarrito: pasajes,
    };
    let response = await axios.post("/api/cambiar-boleto", data);
    if (!response.data.error) {
      setPayment({ url: response.data.url, token: response.data.token });
      payment_form.current.submit();
    }
  };
  const setPasaje = (pasaje) => {
    let carro_temp = { ...carro };

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
          i.piso == 1 ? pasaje.servicioPrimerPiso : pasaje.servicioSegundoPiso,
        piso: i.piso,
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
    setStage(2);
    setCarro(carro_temp);

    setOpenPane(null);
  };
  const getSubtotal = (clientes) => {
    return clientes.reduce((a, b) => {
      a = Number(a) + Number(b.tarifa.replace(".", ""));
      return a;
    }, 0);
  };
  const isPaymentValid = () => {
    let valid = true;
    let ida = carro.clientes_ida.reduce((a, b, k) => {
      console.log(b);
      if (!isValidPasajero(b.pasajero, k, 'ida', setCarro)) {
        a = false;
      }
      return a;
    }, true);

    if (!ida) {
      valid = false;
    }
    return valid;
  };
  const getTotal = () => {
    let amount = carro.clientes_ida.reduce((a, b) => {
      a = Number(a) + Number(b.tarifa.replace(".", ""));
      return a;
    }, 0);
    let total = amount - boletoValido.valor;
    if (total < 0) {
      return 0;
    } else {
      return total;
    }
  };
  const tomarAsiento = async (asiento, viaje, k, piso) => {
    let asientos_temp;

    asientos_temp = [...asientosIda];

    if (asiento.estado == "libre" || asiento.estado == "pet-free") {
      let tarifa =
        piso == 1
          ? parrilla[k].tarifaPrimerPisoInternet
          : parrilla[k].tarifaSegundoPisoInternet;
      if (tarifa > boletoValido.valor) {
        toast.warn("El monto supera al saldo disponible de tu cambio", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return false;
      }
      if (asientos_temp.length >= 1) {
        toast.warn("Maximo 1 pasajes", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return false;
      }

      const reserva = await axios.post("/api/tomar-asiento", {
        servicio: parrilla[k].idServicio,
        bus: piso == 1 ? parrilla[k].busPiso1 : parrilla[k].busPiso2,
        fecha: dayjs(startDate).format("DD/MM/YYYY"),
        origen: parrilla[k].idTerminalOrigen,
        destino: parrilla[k].idTerminalDestino,
        integrador: parrilla[k].integrador,
        asiento: asiento.asiento,
        tarifa:
          piso == 1
            ? parrilla[k].tarifaPrimerPisoInternet
            : parrilla[k].tarifaSegundoPisoInternet,
      });
      if (reserva.data.estadoReserva) {
        asientos_temp.push({
          asiento: asiento.asiento,
          codigoReserva: reserva.data.codigoReserva,
          piso: piso,
          tarifa:
            piso == 1
              ? parrilla[k].tarifaPrimerPisoInternet
              : parrilla[k].tarifaSegundoPisoInternet,
        });

        setAsientosIda(asientos_temp);
      }
      if (asiento.tipo == "asociado" || asiento.tipo == "pet") {
        const reserva = await axios.post("/api/tomar-asiento", {
          servicio: parrilla[k].idServicio,
          fecha: dayjs(startDate).format("DD/MM/YYYY"),
          origen: parrilla[k].idTerminalOrigen,
          destino: parrilla[k].idTerminalDestino,
          integrador: parrilla[k].integrador,
          asiento: asiento.asientoAsociado,

          bus: piso == 1 ? parrilla[k].busPiso1 : parrilla[k].busPiso2,
          tarifa:
            piso == 1
              ? parrilla[k].tarifaPrimerPisoInternet
              : parrilla[k].tarifaSegundoPisoInternet,
        });
        if (reserva.data.estadoReserva) {
          asientos_temp.push({
            asiento: asiento.asientoAsociado,
            codigoReserva: reserva.data.codigoReserva,
            piso: piso,
            tarifa:
              piso == 1
                ? parrilla[k].tarifaPrimerPisoInternet
                : parrilla[k].tarifaSegundoPisoInternet,
          });

          setAsientosIda(asientos_temp);
        }
      }
      reloadPane(k);
    } else if (
      asiento.estado == "ocupado" &&
      asientos_temp.find((i) => asiento.asiento == i.asiento)
    ) {
      let asiento_selected = asientos_temp.find(
        (i) => asiento.asiento == i.asiento
      );

      const reserva = await axios.post("/api/liberar-asiento", {
        servicio: parrilla[k].idServicio,
        fecha: dayjs(startDate).format("DD/MM/YYYY"),
        origen: parrilla[k].idTerminalOrigen,
        destino: parrilla[k].idTerminalDestino,
        integrador: parrilla[k].integrador,
        asiento: asiento.asiento,
        tarifa:
          piso == 1
            ? parrilla[k].tarifaPrimerPisoInternet
            : parrilla[k].tarifaSegundoPisoInternet,
        codigoReserva: asiento_selected.codigoReserva,
      });
      reloadPane(k);
      let parrilla_temp = [...parrilla];
      let asientos1 = await axios.post("/api/mapa-asientos", {
        idServicio: parrilla_temp[k].idServicio,
        tipoBusPiso1: parrilla_temp[k].busPiso1,
        tipoBusPiso2: parrilla_temp[k].busPiso2,
        fechaServicio: dayjs(startDate).format("DD/MM/YYYY"),
        idOrigen: parrilla[k].idTerminalOrigen,
        idDestino: parrilla[k].idTerminalDestino,
        integrador: parrilla[k].integrador,
      });
      let parrilla_mod = [...parrilla];
      parrilla_mod[k].loadingAsientos = false;
      parrilla_mod[k].asientos1 = asientos1.data[1];
      if (parrilla_temp[k].busPiso2) {
        parrilla_mod[k].asientos2 = asientos1.data[2];
      }
      await setParrilla(parrilla_mod);

      asientos_temp = asientos_temp.filter((i) => i.asiento != asiento.asiento);

      setAsientosIda(asientos_temp);
    }
  };
  const setOpenPaneRoot = async (k) => {
    let parrilla_temp = [...parrilla];
    parrilla_temp[k].loadingAsientos = true;
    setParrilla(parrilla_temp);

    setAsientosIda([]);

    setOpenPane(parrilla[k].idServicio);

    let asientos1 = await axios.post("/api/mapa-asientos", {
      idServicio: parrilla_temp[k].idServicio,
      tipoBusPiso1: parrilla_temp[k].busPiso1,
      tipoBusPiso2: parrilla_temp[k].busPiso2,
      fechaServicio: dayjs(startDate).format("DD/MM/YYYY"),
      idOrigen: parrilla[k].idTerminalOrigen,
      idDestino: parrilla[k].idTerminalDestino,
      integrador: parrilla[k].integrador,
    });
    let parrilla_mod = [...parrilla];
    parrilla_mod[k].loadingAsientos = false;
    parrilla_mod[k].asientos1 = asientos1.data[1];
    if (parrilla_temp[k].busPiso2) {
      parrilla_mod[k].asientos2 = asientos1.data[2];
    }

    setParrilla(parrilla_mod);
  };
  const reloadPane = async (k) => {
    return new Promise(async (resolve, reject) => {
      let parrilla_temp = [...parrilla];
      let asientos1 = await axios.post("/api/mapa-asientos", {
        idServicio: parrilla_temp[k].idServicio,
        tipoBusPiso1: parrilla_temp[k].busPiso1,
        tipoBusPiso2: parrilla_temp[k].busPiso2,
        fechaServicio: dayjs(startDate).format("DD/MM/YYYY"),
        idOrigen: parrilla[k].idTerminalOrigen,
        idDestino: parrilla[k].idTerminalDestino,
        integrador: parrilla[k].integrador,
      });
      let parrilla_mod = [...parrilla];
      parrilla_mod[k].loadingAsientos = false;
      parrilla_mod[k].asientos1 = asientos1.data[1];
      if (parrilla_temp[k].busPiso2) {
        parrilla_mod[k].asientos2 = asientos1.data[2];
      }
      console.log(parrilla_mod);
      setParrilla(parrilla_mod);
      resolve();
    });
  };
  return (
    <Layout>
      <Head>
        <title>PullmanBus | Confirmación Boleto</title>
      </Head>
      <div className="pullman-mas mb-5">
        <div className="container">
          <div className="row py-4">
            <div className="col-12">
              <span>Home &gt; Te ayudamos &gt; Cambio de boleto </span>
            </div>
          </div>
          <div className="row pb-5">
            <div className="col-md-6 col-12 d-flex align-items-center">
              <div>
                <img src="img/icon-estrella-mas.svg" alt="" />
                <h1>
                  Te Ayudamos con tu
                  <br /> <strong>cambio de Boleto</strong>
                </h1>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna
                  aliqualabore et dolor
                </p>
              </div>
            </div>
            <div className="col-md-6 col-12 foto-header">
              <img src="img/cambioboleto2.svg" className="img-fluid" alt="" />
            </div>
          </div>
        </div>
      </div>
      {stage == 0 ? (
        <div className="codigo-boleto mb-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 col-md-6">
                <div className="bloque">
                  <h2>
                    Ingresa el código de tu boleto para{" "}
                    <strong>visualizar el boleto que quieres cambiar</strong>
                  </h2>
                  <div className="grupo-campos">
                    <label className="label-input">Código de boleto</label>
                    <input
                      type="text"
                      name=""
                      onChange={(e) => setBoleto(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="w-100">
                    <button onClick={validarBoleto} className="btn">
                      Buscar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {stage == 1 ? (
        <div className="ingreso-destino mb-5">
          <div className="container">
            <div className="row">
              <div className="col-12 col-md-6 pt-2">
                <div className="w-100">
                  <label className="boleto">
                    <input type="checkbox" />
                    <div className="block">
                      <div className="content-block">
                        <div className="row">
                          <div className="col-4">
                            <div className="hora">
                              {boletoValido.horaEmbarcacion}
                            </div>
                            <strong>{boletoValido.origenNombre}</strong>
                            <div className="fecha">
                              Mar {boletoValido.fechaEmbarcacion}
                            </div>
                          </div>
                          <div className="col-4 text-center pt-4">
                            <span>Duración</span>
                            <span className="datos">
                              <strong>28 hrs 50 min</strong>
                            </span>
                          </div>
                          <div className="col-4 text-end">
                            <div className="hora">12:40</div>
                            <strong>{boletoValido.destinoNombre}</strong>
                            <div className="fecha">Mié 02-12-21</div>
                          </div>
                        </div>
                        <div className="barra">
                          <img src="img/icon-barra.svg" />
                        </div>
                        <div className="row">
                          <div className="col-4">
                            <span>Estado:</span>
                            <strong>
                              {boletoValido.estadoActualDescripcion}
                            </strong>
                          </div>
                          <div className="col-4 text-center">
                            <span>Precio:</span>
                            <strong className="precio">
                              ${boletoValido.valorFormateado}
                            </strong>
                          </div>
                          <div className="col-4 text-end">
                            <span>N° asiento</span>
                            <strong>{boletoValido.asiento}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="bloque">
                  <div className="grupo-campos">
                    <label className="label-input">¿De dónde viajamos?</label>
                    <Input
                      className="sel-input origen"
                      items={ciudades.map((i) => {
                        return { value: i.codigo, label: i.nombre };
                      })}
                      selected={
                        origen
                          ? [ciudades.find((i) => i.codigo == origen)].map(
                              (i) => {
                                return { value: i.codigo, label: i.nombre };
                              }
                            )
                          : ""
                      }
                      setSelected={setOrigen}
                    />
                  </div>
                  <div className="grupo-campos">
                    <label className="label-input">¿A dónde viajamos?</label>
                    <Input
                      className="sel-input destino"
                      items={destinos.map((i) => {
                        return { value: i.codigo, label: i.nombre };
                      })}
                      selected={
                        destino && destinos.length > 0
                          ? [destinos.find((i) => i.codigo == destino)].map(
                              (i) => {
                                return { value: i.codigo, label: i.nombre };
                              }
                            )
                          : ""
                      }
                      setSelected={setDestino}
                    />
                  </div>
                  <div className="grupo-campos mb-4">
                    <label className="label-input">¿Cuándo viajamos?</label>

                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      filterDate={isValidStart}
                      locale={"es"}
                      dateFormat="dd/MM/yyyy"
                      customInput={<CustomInput />}
                    />
                  </div>
                  <div className="w-100">
                    <button onClick={searchServicios} className="btn">
                      Buscar servicios
                    </button>
                  </div>
                </div>
              </div>
              <div className="contenido-busqueda">
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
                              if (sort == "precio-up") {
                                return (
                                  a.tarifaPrimerPisoInternet -
                                  b.tarifaPrimerPisoInternet
                                );
                              } else if (sort == "precio-down") {
                                return (
                                  b.tarifaPrimerPisoInternet -
                                  a.tarifaPrimerPisoInternet
                                );
                              } else if (sort == "hora-up") {
                                return (
                                  Number(a.horaSalida.replace(":", "")) -
                                  Number(b.horaSalida.replace(":", ""))
                                );
                              } else {
                                return (
                                  Number(b.horaSalida.replace(":", "")) -
                                  Number(a.horaSalida.replace(":", ""))
                                );
                              }
                            }
                          })
                          .map((i, k) => {
                            if (mascota_allowed && i.mascota == 0) {
                              return;
                            }

                            return (
                              <Boleto
                                {...i}
                                openPane={openPane}
                                asientos_selected={asientosIda}
                                stage={stage}
                                setPasaje={setPasaje}
                                tomarAsiento={tomarAsiento}
                                setOpenPane={setOpenPaneRoot}
                                k={k}
                              />
                            );
                          })}
                      </>
                    ) : (
                      <>
                        <h5 className="p-2">
                          Lo sentimos, no existen resultados para su búsqueda
                        </h5>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {stage == 2 ? (
        <div className="pago">
          <div className="container">
            <div className="bloque bg-white pasajeros">
              <h2>Registro de pasajeros</h2>
              <div className="bloque " style={{ backgroundColor: "#F6F8FB" }}>
                <div className="top-asiento">
                  <div className="row">
                    <div className="col-12 col-md-6">
                      <div className="row">
                        <div className="col-2">
                          <strong>IDA</strong>
                        </div>
                        <div className="col-1">
                          <img src="img/icon-ida-viaje.svg" alt="" />
                        </div>
                        <div className="col-9">
                          <div className="w-100 mb-3">
                            <span>
                              <strong className="d-inline">Arica</strong> /{" "}
                              {carro.pasaje_ida.terminalSalida}
                            </span>{" "}
                            <br />
                            <span>
                              {carro.pasaje_ida.horaSalida} /{" "}
                              {carro.pasaje_ida.fechaSalida}
                            </span>
                          </div>
                          <div className="w-100">
                            <span>
                              <strong className="d-inline">Santiago</strong> /{" "}
                              {carro.pasaje_ida.terminalLLegada}
                            </span>{" "}
                            <br />
                            <span>
                              {carro.pasaje_ida.horaLlegada} /{" "}
                              {carro.pasaje_ida.fechaLlegada}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {carro.clientes_ida.map((i, k) => {
                return (
                  <div
                    className={
                      "d-flex flex-col bloque-pasajero " +
                      (i.open ? "active" : "")
                    }
                  >
                    <div
                      className={"header-pasajero "}
                      onClick={() => {
                        openPasajero(k, "ida");
                      }}
                    >
                      <h5>
                        Pasajero {k + 1} - Asiento {i.asiento} - Piso {i.piso}
                      </h5>{" "}
                      {isValidPasajero(i.pasajero, k, 'ida', setCarro) ? <Check /> : ""}
                    </div>
                    <div className="content-pasajero d-flex justify-content-center">
                      <div className="col-12 col-md-8">
                        <div className="row">
                          <div className="col-12 col-md-6">
                            <div className="grupo-campos">
                              <label className="label-input">Nombres</label>
                              <input
                                type="text"
                                value={i.pasajero["nombre"]}
                                className="form-control"
                                name="nombre"
                                onChange={(e) => setDataPasaje(e.target, k)}
                              />
                            </div>
                          </div>
                          <div className="col-12 col-md-6">
                            <div className="grupo-campos">
                              <label className="label-input">Apellidos</label>
                              <input
                                type="text"
                                value={i.pasajero["apellido"]}
                                className="form-control"
                                name="apellido"
                                onChange={(e) => setDataPasaje(e.target, k)}
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
                                      i.pasajero["tipoRut"] == "rut"
                                        ? "true"
                                        : ""
                                    }
                                    value={"rut"}
                                    name="tipoRut"
                                    onChange={(e) => {
                                      console.log(
                                        e.target.value,
                                        e.target.name
                                      );
                                      setDataPasaje(e.target, k);
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
                                      i.pasajero["tipoRut"] == "pasaporte"
                                        ? "true"
                                        : ""
                                    }
                                    value={"pasaporte"}
                                    name="tipoRut"
                                    onChange={(e) => setDataPasaje(e.target, k)}
                                  />
                                  <span className="checkmark"></span>
                                </label>
                              </div>
                            </div>
                            <div className="grupo-campos">
                              <input
                                type="text"
                                value={i.pasajero["rut"]}
                                className={
                                  "form-control " +
                                  (i.pasajero.errors.includes("rut")
                                    ? "is-invalid"
                                    : "")
                                }
                                name="rut"
                                onChange={(e) => setDataPasaje(e.target, k)}
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
                                value={i.pasajero["nacionalidad"]}
                                onChange={(e) => setDataPasaje(e.target, k)}
                              >
                                {props.nacionalidades.map((ii) => (
                                  <option value={ii.valor}>
                                    {ii.descripcion}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="col-12 col-md-6">
                            <div className="grupo-campos">
                              <label className="label-input">E-mail</label>
                              <input
                                type="email"
                                name="email"
                                onChange={(e) => setDataPasaje(e.target, k)}
                                value={i.pasajero["email"]}
                                className={
                                  "form-control " +
                                  (i.pasajero.errors.includes("email")
                                    ? "is-invalid"
                                    : "")
                                }
                              />
                            </div>
                          </div>
                          <div className="col-12 col-md-6">
                            <div className="grupo-campos">
                              <label className="label-input">
                                Confirma E-mail
                              </label>
                              <input
                                type="email"
                                name="email_2"
                                onChange={(e) => setDataPasaje(e.target, k)}
                                value={i.pasajero["email_2"]}
                                className={
                                  "form-control " +
                                  (i.pasajero.errors.includes("email_2")
                                    ? "is-invalid"
                                    : "")
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bloque comprador  bg-white">
              <h2>Resumen de compra</h2>
              <div className="row">
                <div className="col-12 col-md-7">
                  {carro.clientes_ida ? (
                    <div className="row cantidad-asiento mb-5">
                      <div className="col-8">
                        {function () {
                          let servicios = carro.clientes_ida.reduce((a, b) => {
                            if (!a[b.servicio]) {
                              a[b.servicio] = [];
                            }
                            a[b.servicio].push(b);
                            return a;
                          }, {});
                          return Object.keys(servicios).map((i) => (
                            <>
                              <div className="row">
                                <div className="col-8">
                                  <h4>
                                    {servicios[i].length}X boleto {i}
                                  </h4>
                                </div>
                                <div className="col-4 d-flex justify-content-end">
                                  <h3>
                                    $
                                    {getSubtotal(servicios[i]).toLocaleString(
                                      "es"
                                    )}
                                  </h3>
                                </div>
                              </div>
                              <div className="row">
                                <div className="col-8">
                                  <p>Boleto Cambio</p>
                                </div>
                                <div className="col-4 d-flex justify-content-end">
                                  <h4>${boletoValido.valorFormateado}</h4>
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
                </div>
                <div className="col-12 col-md-5 total-pagar">
                  {/*<div className="row">
                        <div className="col-6 d-flex align-items-center">
                          <h3>Total a pagar:</h3>
                        </div>
                        <div className="col-6 d-flex justify-content-end">
                          <h2>${getTotal().toLocaleString("es")}</h2>
                        </div>
                    </div>*/}
                  <div className="row my-5">
                    {/*<div className="col-12">
                         {
                           props.mediosDePago.map((i)=><img src={"data:image/png;base64,"+i.imagen} />)
                         }
                        
                        </div>*/}
                  </div>
                  <div className="row">
                    <div className="col-12">
                      <a
                        href="#"
                        className={
                          "btn " + (!isPaymentValid() ? "disabled" : "")
                        }
                        disabled={!isPaymentValid()}
                        onClick={(e) => {
                          e.preventDefault();
                          sendToPayment();
                        }}
                      >
                        {getTotal() == 0
                          ? "Cambiar Boleto"
                          : "Pagar Diferencia"}
                      </a>
                      {/*<form ref={payment_form} style={{display:"none"}} method="POST" action={payment.url}>
                            <input name="TBK_TOKEN" value={payment.token} />
                        </form>*/}
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
      <ToastContainer />
    </Layout>
  );
}

export const getServerSideProps = withIronSessionSsr(async function ({
  req,
  res,
}) {
  let ciudades = await axios.get(
    publicRuntimeConfig.site_url + "/api/ciudades"
  );
  let nacionalidades = await axios.get(
    publicRuntimeConfig.site_url + "/api/nacionalidades"
  );
  let dias = await axios.get(publicRuntimeConfig.site_url + "/api/dias");
  let mediosDePago = await axios.get(
    publicRuntimeConfig.site_url + "/api/medios-de-pago"
  );
  return {
    props: {
      ciudades: ciudades.data,
      dias: dias.data,
      nacionalidades: nacionalidades.data,
      mediosDePago: mediosDePago.data,
    },
  };
},
sessionOptions);
