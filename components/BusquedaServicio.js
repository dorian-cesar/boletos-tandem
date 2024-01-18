import axios from "axios";
import dayjs from "dayjs";
import DatePicker, { registerLocale } from "react-datepicker";
import Link from "next/link";
import Input from "../components/Input";
import { useEffect, useState, forwardRef } from "react";
import es from "date-fns/locale/es";
import { useRouter } from "next/router";
import Tab from "../components/Tab";
import TabPanel from "../components/TabPanel";

registerLocale("es", es);

const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <input
    type="text"
    className="fecha-input form-control"
    onClick={onClick}
    ref={ref}
    defaultValue={value}
    readOnly={true}
  />
));

const BusquedaServicio = (props) => {
  const { origenes, dias, isShowMascota = false } = props;
  const [mascota_allowed, setMascota] = useState(false);
  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);
  const [destinos, setDestinos] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().toDate());
  const [endDate, setEndDate] = useState(null);
  const [datePickerKey, setDatePickerKey] = useState(0);

  const [activeTab, setActiveTab] = useState("Búsqueda de Servicio");

  const router = useRouter();

  useEffect(() => {
    setDatePickerKey((prevKey) => prevKey + 1);
  }, [startDate]);

  async function redireccionarBuscarServicio() {
    await router.push(
      `/comprar?origen=${origen}&destino=${destino}&startDate=${
        startDate && dayjs(startDate).format("YYYY-MM-DD")
      }&endDate=${endDate && dayjs(endDate).format("YYYY-MM-DD")}`
    );
    if (router.asPath.includes("comprar")) {
      router.reload();
    }
  }

  async function redireccionarBuscarCuponera() {
    await router.push(`/comprarCuponera?origen=${origen}&destino=${destino}`);
    if (router.asPath.includes("comprarCuponera")) {
      router.reload();
    }
  }

  async function redireccionarBuscarServicioCuponera() {
    await router.push(
      `/confirmacionCuponera?origen=${origen}&destino=${destino}&startDate=${
        startDate && dayjs(startDate).format("YYYY-MM-DD")
      }`
    );
    if (router.asPath.includes("confirmacionCuponera")) {
      router.reload();
    }
  }

  async function getDestinos() {
    if (origen !== null) {
      try {
        let { data } = await axios.post("/api/destinos", {
          id_ciudad: origen,
        });
        setDestinos(data);
      } catch ({ message }) {
        console.error(`Error al obtener destinos [${message}]`);
      }
    }
  }

  async function isValidStart(date) {
    return (
      dayjs(date).isAfter(dayjs().subtract(1, "day")) &&
      dayjs(date).isBefore(dayjs().add(dias, "day"))
    );
  }

  async function isValidAfter(date) {
    return (
      dayjs(date).isAfter(dayjs(startDate).subtract(1, "day")) &&
      dayjs(date).isBefore(dayjs().add(dias, "day"))
    );
  }

  function retornaCiudadesSelect(arrayCiudades) {
    return arrayCiudades.map((ciudad) => {
      return {
        value: ciudad?.codigo,
        label: ciudad?.nombre,
      };
    });
  }

  function cambiarOrigen(origenSeleccionado) {
    setDestino(null);
    setOrigen(origenSeleccionado);
  }

  useEffect(() => {
    (async () => await getDestinos())();
  }, [origen]);

  useEffect(() => {
    if (endDate && dayjs(startDate).isAfter(dayjs(endDate))) {
      setEndDate(dayjs(startDate).toDate());
    }
  }, [startDate]);

  useEffect(() => {
    const { origen, destino, startDate, endDate } = router.query;
    const startDateFromUrl =
      startDate && startDate !== "null" && dayjs(startDate).isValid()
        ? dayjs(startDate).toDate()
        : null;

    if (origen) setOrigen(origen);
    if (destino) setDestino(destino);

    if (startDateFromUrl) {
      setStartDate(dayjs(startDateFromUrl).toDate());
    }

    if (endDate && endDate !== "null") {
      setEndDate(dayjs(endDate).toDate());
    }
  }, [router.query]);

  useEffect(() => {
    const savedActiveTab = localStorage.getItem("activeTab");
    if (savedActiveTab) {
      setActiveTab(savedActiveTab);
    }
  }, []);

  const handleTabClick = (label) => {
    localStorage.setItem("activeTab", label);
    setActiveTab(label);
  };

  return (
    <div className="container pb-5">
      <div className="row ">
        <div className="col-12">
          <div className="bloque m-neg">
            <div className="row mb-3 ">
              <div className="col-12">
                {/* <div className="tabs">
                  <Tab
                    label="Búsqueda de Servicio"
                    activeTab={activeTab}
                    onClick={handleTabClick}
                  />
                  <Tab
                    label="Confirmar tu cuponera"
                    activeTab={activeTab}
                    onClick={handleTabClick}
                  />
                  <Tab
                    label="Cuponera"
                    activeTab={activeTab}
                    onClick={handleTabClick}
                  />
                </div> */}
                <div className="tab-content">
                  <TabPanel title="Búsqueda de Servicio" activeTab={activeTab}>
                    <div className="col-12 col-md-12">
                      <h1 className="titulo-azul">
                        ¿Cúal es tu próximo destino?
                      </h1>
                      {isShowMascota && (
                        <div
                          className="title-mascota-abordo"
                          onClick={() => setMascota(!mascota_allowed)}
                        >
                          <img
                            src={
                              mascota_allowed
                                ? "img/icon/buttons/paw-outline-orange.svg"
                                : "img/icon/buttons/paw-outline.svg"
                            }
                            style={{
                              marginRight: "5px",
                              color: mascota_allowed
                                ? "var(--color-icon-activo, #00FF00)"
                                : "var(--color-icon-inactivo, #FF0000)",
                            }}
                          />
                          <span className="label-titulo-busqueda-servicio">
                            Mascota a bordo
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="row search-row">
                      <div className="col-12 col-md-6 col-lg-2">
                        <div className="grupo-campos">
                          <label className="label-titulo-busqueda-servicio">
                            Origen
                          </label>
                          <Input
                            className="sel-input origen"
                            placeholder="Seleccione origen"
                            items={retornaCiudadesSelect(origenes)}
                            selected={
                              origen &&
                              retornaCiudadesSelect([
                                origenes.find((i) => i.codigo == origen),
                              ])
                            }
                            setSelected={cambiarOrigen}
                          />
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-lg-2">
                        <div className="grupo-campos">
                          <label className="label-titulo-busqueda-servicio">
                            Destino
                          </label>
                          <Input
                            className="sel-input destino"
                            placeholder="Seleccione destino"
                            items={retornaCiudadesSelect([
                              ...destinos,
                              {
                                codigo: "NO_OPTIONS",
                                nombre: "Por favor seleccione un origen",
                              },
                            ])}
                            selected={
                              destino &&
                              destinos.length > 0 &&
                              retornaCiudadesSelect([
                                destinos.find((i) => i.codigo == destino),
                              ])
                            }
                            setSelected={setDestino}
                          />
                        </div>
                      </div>
                      <div className="col-6 col-md-6 col-lg-2">
                        <div className="grupo-campos">
                          <label className="label-titulo-busqueda-servicio">
                            Salida
                          </label>
                          <DatePicker
                            key={datePickerKey}
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            filterDate={isValidStart}
                            locale={"es"}
                            minDate={new Date()}
                            dateFormat="dd/MM/yyyy"
                            customInput={<CustomInput />}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-2">
                        <div className="grupo-campos">
                          <label className="label-titulo-busqueda-servicio">
                            Vuelta
                          </label>
                          <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            filterDate={isValidAfter}
                            locale={"es"}
                            minDate={startDate}
                            dateFormat="dd/MM/yyyy"
                            customInput={<CustomInput />}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-12 col-lg-2">
                        <label className="label-titulo-busqueda-servicio"></label>
                        <div
                          className="button-busqueda-servicio"
                          onClick={
                            origen && destino && redireccionarBuscarServicio
                          }
                        >
                          <img src="img/icon-buscar-blanco.svg" /> Buscar
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                  <TabPanel title="Confirmar tu cuponera" activeTab={activeTab}>
                    <div className="col-12 col-md-12">
                      <h1 className="titulo-azul">
                        ¿Cúal es tu próximo destino?
                      </h1>
                      {isShowMascota && (
                        <div
                          className="title-mascota-abordo"
                          onClick={() => setMascota(!mascota_allowed)}
                        >
                          <img
                            src={
                              mascota_allowed
                                ? "img/icon/buttons/paw-outline-orange.svg"
                                : "img/icon/buttons/paw-outline.svg"
                            }
                            style={{
                              marginRight: "5px",
                              color: mascota_allowed
                                ? "var(--color-icon-activo, #00FF00)"
                                : "var(--color-icon-inactivo, #FF0000)",
                            }}
                          />
                          <span className="label-titulo-busqueda-servicio">
                            Mascota a bordo
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="row search-row">
                      <div className="col-12 col-md-6 col-lg-2">
                        <div className="grupo-campos">
                          <label className="label-titulo-busqueda-servicio">
                            Origen
                          </label>
                          <Input
                            className="sel-input origen"
                            placeholder="Seleccione origen"
                            items={retornaCiudadesSelect(origenes)}
                            selected={
                              origen &&
                              retornaCiudadesSelect([
                                origenes.find((i) => i.codigo == origen),
                              ])
                            }
                            setSelected={cambiarOrigen}
                          />
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-lg-2">
                        <div className="grupo-campos">
                          <label className="label-titulo-busqueda-servicio">
                            Destino
                          </label>
                          <Input
                            className="sel-input destino"
                            placeholder="Seleccione destino"
                            items={retornaCiudadesSelect([
                              ...destinos,
                              {
                                codigo: "NO_OPTIONS",
                                nombre: "Por favor seleccione un origen",
                              },
                            ])}
                            selected={
                              destino &&
                              destinos.length > 0 &&
                              retornaCiudadesSelect([
                                destinos.find((i) => i.codigo == destino),
                              ])
                            }
                            setSelected={setDestino}
                          />
                        </div>
                      </div>
                      <div className="col-6 col-md-6 col-lg-2">
                        <div className="grupo-campos">
                          <label className="label-titulo-busqueda-servicio">
                            Salida
                          </label>
                          <DatePicker
                            key={datePickerKey}
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            filterDate={isValidStart}
                            locale={"es"}
                            minDate={new Date()}
                            dateFormat="dd/MM/yyyy"
                            customInput={<CustomInput />}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-12 col-lg-2">
                        <label className="label-titulo-busqueda-servicio"></label>
                        <div
                          className="button-busqueda-servicio"
                          onClick={
                            origen && destino && redireccionarBuscarServicioCuponera
                          }
                        >
                          <img src="img/icon-buscar-blanco.svg" /> Buscar
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                  <TabPanel title="Cuponera" activeTab={activeTab}>
                    <h1 className="titulo-azul">Buscar cuponeras</h1>
                    <div className="title-mascota-abordo"></div>
                    <div className="row search-row">
                      <div className="col-12 col-md-6 col-lg-2 ">
                        <div className="grupo-campos">
                          <label className="label-titulo-busqueda-servicio">
                            Origen
                          </label>
                          <Input
                            className="sel-input origen"
                            placeholder="Seleccione origen"
                            items={retornaCiudadesSelect(origenes)}
                            selected={
                              origen &&
                              retornaCiudadesSelect([
                                origenes.find((i) => i.codigo == origen),
                              ])
                            }
                            setSelected={cambiarOrigen}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-2 ">
                        <div className="grupo-campos">
                          <label className="label-titulo-busqueda-servicio">
                            Destino
                          </label>
                          <Input
                            className="sel-input destino"
                            placeholder="Seleccione destino"
                            items={retornaCiudadesSelect([
                              ...destinos,
                              {
                                codigo: "NO_OPTIONS",
                                nombre: "Por favor seleccione un origen",
                              },
                            ])}
                            selected={
                              destino &&
                              destinos.length > 0 &&
                              retornaCiudadesSelect([
                                destinos.find((i) => i.codigo == destino),
                              ])
                            }
                            setSelected={setDestino}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 col-lg-12">
                        <label className="label-titulo-busqueda-servicio"></label>
                        <div
                          className="button-busqueda-servicio"
                          onClick={
                            origen && destino && redireccionarBuscarCuponera
                          }
                          
                        >
                          <img src="img/icon-buscar-blanco.svg" /> Buscar
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusquedaServicio;
