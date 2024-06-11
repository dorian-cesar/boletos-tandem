import axios from "axios";
import dayjs from "dayjs";
import DatePicker, { registerLocale } from "react-datepicker";
import Link from "next/link";
import Input from "../Input";
import { useEffect, useState, forwardRef, useRef } from "react";
import es from "date-fns/locale/es";
import { useRouter } from "next/router";
import styles from "./BusquedaServicio.module.css";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import Popup from "../Popup/Popup";
import ModalEntities from "entities/ModalEntities";
import { liberarAsientos } from "store/usuario/compra-slice"
import { decryptDataNoSaved, encryptDataNoSave, decryptData } from "utils/encrypt-data";
import LocalStorageEntities from "entities/LocalStorageEntities";
import ReCAPTCHA from "react-google-recaptcha";

registerLocale("es", es);

const captchaSiteKey = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA;

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

  const buttonRef = useRef();

  const router = useRouter();

  const dispatch = useDispatch();
  const listaCarrito = useSelector((state) => state.compra.listaCarrito);
  const {
    dias,
    isShowMascota = false,
    isHomeComponent = true
  } = props;

  const [decryptedData, setDecryptedData] = useState(null);
  const [mascota_allowed, setMascota] = useState(false);
  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);
  const [destinos, setDestinos] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [datePickerKey, setDatePickerKey] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("Búsqueda de Servicio");

  const [mostrarPopup, setMostrarPopup] = useState(false);

  const [user, setUser] = useState();
  const [disabledButton, setDisabledButton] = useState(true);
  const [origenes, setOrigenes] = useState([]);

  const captchaRef = useRef();

  useEffect(() => {
    getOrigins();
  }, []);
  
  useEffect(() => {
    const user = decryptData(LocalStorageEntities.user_auth);
    setUser(user);
  }, []);

  const abrirPopup = () => {
    setMostrarPopup(true);
  };
  const cerrarPopup = () => {
    setMostrarPopup(false);
  };

  useEffect(() => {
    if( router.query.search ) {
      setDecryptedData(decryptDataNoSaved(router.query.search, 'search'));
      setStartDate(decryptedData?.startDate ? dayjs(decryptedData.startDate).toDate() : dayjs().toDate());
      setEndDate(decryptedData?.endDate ? dayjs(decryptedData.endDate).toDate() : null);
    }
    if( !decryptedData ) {
      setStartDate(dayjs().toDate());
      setEndDate(null);
    }
  }, [])

  useEffect(() => {
    setDatePickerKey((prevKey) => prevKey + 1);
  }, [startDate]);

  async function redireccionarBuscarServicio() {
    if( isLoading ) return;

    setIsLoading(true);

    try {
      const token = await captchaRef.current.executeAsync();

      const tokenVerify = await fetch('/api/token-verify', {
        method: 'POST',
        body: JSON.stringify({ token })
      });

      const tokenVerifyResponse = await tokenVerify.json();

      if( !tokenVerifyResponse.success ) {
        return;
      }

      dispatch(liberarAsientos());
      
      const data = {
        origen,
        destino,
        startDate: startDate ? dayjs(startDate).format("YYYY-MM-DD") : null,
        endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : null,
        mascota_allowed
      }

      const encriptedData = encryptDataNoSave(data, 'search');

      router.replace(`/comprar?search=${ encriptedData }`).then(() => window.location.reload()).catch(_ => setIsLoading(false));
    } catch(error) {
      setIsLoading(false);
    }
  }

  async function getOrigins() {
    try {
      const res = await fetch('/api/ciudades');
      const ciudades = await res.json()
      setOrigenes(ciudades);
    } catch(error) {
      console.log(`Error al obtener ciudades [${ error?.message }]`);
    }
  }

  async function getDestinos() {
    if (origen !== null) {
      try {
        let { data } = await axios.post("/api/destinos", {
          id_ciudad: origen.codigo,
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
        value: ciudad,
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
    if( !router.query.search ) return;
    const decryptedData =  decryptDataNoSaved(router.query.search, 'search');
    const { origen, destino, startDate, endDate } = decryptedData;
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
  }, [router.query.search]);

  useEffect(() => {
    const savedActiveTab = localStorage.getItem("activeTab");
    if (savedActiveTab) {
      setActiveTab(savedActiveTab);
    }
  }, []);

  function invertirDestinos() {
    const origenBackup = origen;
    const destinoBackup = destino;
    setOrigen(destinoBackup);
    setDestino(origenBackup);
  }

  return (
    <>
      <section className={ isHomeComponent ? 'container pb-5' : 'container py-1' }>
        <div className={ isHomeComponent ? styles['seleccion-servicio'] : '' }>
          <div>
            {isHomeComponent && (
              <h1 className={styles["titulo-azul"]}>
                ¿Cúal es tu próximo destino?
              </h1>
            )}
            {mostrarPopup && (
              <Popup
                modalKey={ModalEntities.delete_car}
                modalClose={cerrarPopup}
                modalMethods={null}
              />
            )}
            {isShowMascota && (
              <div
                className={styles["title-mascota-abordo"]}
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
                <span
                  className={styles["label-titulo-busqueda-servicio"]}
                >
                  Mascota a bordo
                </span>
              </div>
            )}
          </div>
          <div className={ styles['input-container'] }>
            <div className={styles["grupo-campos"]}>
              <label className={styles["label-titulo-busqueda-servicio"]}>Origen</label>
              <Input
                className="sel-input origen"
                placeholder="Seleccione origen"
                items={retornaCiudadesSelect(origenes)}
                selected={
                  origen &&
                  retornaCiudadesSelect([
                    origenes.find((i) => i.codigo == origen.codigo),
                  ])
                }
                setSelected={cambiarOrigen}/>
            </div>
            <img
              src="img/repeat-outline.svg"
              onClick={() => invertirDestinos()}
              className="pointer"
            />
            <div className={ styles["grupo-campos"] }>
              <label className={ styles["label-titulo-busqueda-servicio"] }>
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
                    destinos.find((i) => i.codigo == destino.codigo),
                  ])
                }
                setSelected={setDestino}/>
            </div>
            <div className={styles["grupo-campos"]}>
              <label
                className={styles["label-titulo-busqueda-servicio"]}
              >
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
            <div className={styles["grupo-campos"]}>
              <label
                className={styles["label-titulo-busqueda-servicio"]}
              >
                Vuelta
              </label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                filterDate={isValidAfter}
                locale={"es"}
                minDate={startDate}
                dateFormat="dd/MM/yyyy"
                className={ styles['input'] }
                customInput={<CustomInput />}
              />
            </div>
            <div className={styles["grupo-campos"]}>
              <label
                className={styles["label-titulo-busqueda-servicio"]}
              ></label>
              <button
                className={`${styles["button-busqueda-servicio"]} ${ isLoading ? styles['loading-button'] : '' }`}
                onClick={redireccionarBuscarServicio}
                disabled={!origen || !destino}
              >
                <img src="img/icon-buscar-blanco.svg" /> Buscar
              </button>
            </div>
            <div className="w-100 d-flex justify-content-end">
              <ReCAPTCHA
                sitekey={captchaSiteKey}
                size='invisible'
                ref={captchaRef}
              />
            </div>
            <div 
              className="d-none"
              ref={buttonRef}
              data-bs-toggle="modal"
              data-bs-target="#loginModal"></div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BusquedaServicio;
