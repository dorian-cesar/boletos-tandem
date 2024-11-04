import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import styles from "./Boleto.module.css";
import Parrilla from "../Parrilla/Parrilla";

import 'swiper/css';
import 'swiper/css/effect-flip';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import LoadingOverlay from "react-loading-overlay";
import axios from "axios";
import { toast } from "react-toastify";
import { format } from "@formkit/tempo";
import { useSelector } from "react-redux";

import { decryptData } from "utils/encrypt-data";
import LocalStorageEntities from "entities/LocalStorageEntities";

var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
const Boleto = (props) => {
  const buttonRef = useRef();

  const [isOpened, setIsOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowItinerary, setIsShowItinerary] = useState(false);
  const [itinerario, setItinerario] = useState([]);
  const { origen, destino } = useSelector((state) => state.compra);
  const [user, setUser] = useState();

  const handleOpenPane = () => {
    if( !user ) {
      // buttonRef.current.click();
      // return;
    }
    setIsOpened(!isOpened);
  }
  
  useEffect(() => {
    const user = decryptData(LocalStorageEntities.user_auth);
    setUser(user);
  }, []);

  let duracion = dayjs(
    props.fechaLlegada + " " + props.horaLlegada,
    "DD/MM/YYYY HH:mm"
  ).diff(
    dayjs(props.fechaSalida + " " + props.horaSalida, "DD/MM/YYYY HH:mm"),
    "minute"
  );

  const clpFormat = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  });

  duracion = Math.floor(duracion / 60) + " hrs " + (duracion % 60) + " min";

  async function showItinerary() {
    console.log('PROPS:::', props);
    if (itinerario.length === 0) {
      try {
        const { data } = await axios.post("/api/itinerario", { servicio: props.idServicio });
        setItinerario(data.object);
      } catch (error) {
        toast.error('Error al obtener el itinerario', {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
        });
      }
    }
    setIsShowItinerary(!isShowItinerary);
  }

  return (
    <section className={ `bg-white shadow-sm rounded-3 p-2 ${ styles["info-container"] }` }>
      <div className="row justify-content-evenly">
        <div className="d-flex flex-col col-7 px-2 py-0 p-md-3">
          <div className="d-flex flex-row justify-content-between p-2">
            <img src="img/logo-pullmanbus.svg" className="img-fluid" width={ 150 } height={ 25 } alt="Logo Pullman Bus"/>
            {props.mascota == '1' ? <img src="img/icon/logos/paw-outline.svg" /> : <div></div>}
          </div>
          <div className="row mt-1 pt-2 pb-3 gap-2 gap-md-0 justify-content-evenly">
            <div className="row col-12 col-md-4 align-items-center text-center">
              <div className="col-4 col-md-12 d-flex flex-col">
                <span className="fw-bold mb-2">{props.horaSalida}</span>
              </div>
              <div className="col-8 col-md-12 d-flex flex-col">
                <span className="fw-bold">{props.stage === 0 ? origen?.nombre : destino?.nombre}</span>
                <span className={ `${ styles["travel-terminal-subtitle"] }` }>{props.terminalOrigen}</span>
                {/* <span>{props.fechaSalida}</span> */}
              </div>
            </div>
            <div className="col-12 col-md-4 align-self-center d-flex flex-col text-center align-items-center">
              <span className={`fw-normal ${ styles["travel-duration"]}`}>Duración: {duracion}</span>
            </div>
            <div className="row col-12 col-md-4 align-items-center text-center">
              <div className="col-4 col-md-12 d-flex flex-col">
                <span className="fw-bold mb-2">{props.horaLlegada}</span>
              </div>
              <div className="col-8 col-md-12 d-flex flex-col">
                <span className="fw-bold">{props.stage === 0 ? destino?.nombre : origen?.nombre}</span>
                <span className={ `${ styles["travel-terminal-subtitle"] }` }>{props.terminalDestino}</span>
                {/* <span>{props.fechaLlegada}</span> */}
              </div>
            </div>
          </div>
        </div>
        <div className={ `col-5 col-xs-4 col-sm-4 d-flex flex-col p-0 p-xs-0 p-sm-0 p-md-3 p-xs-2 p-sm-2 justify-content-center align-content-center ${ styles['border-dashed']} gap-3` }>
          <div className={ `p-2 d-flex flex-col gap-2 m-auto text-center fw-bold ${ styles['floor-pricing']}` }>
            { props.tarifaPrimerPisoInternet && (
              props.tarifaValor && props.tarifaValor.primerPisoInternet ? 
              (<span>Piso 1 desde: <b>{ clpFormat.format(props.tarifaValor.primerPisoInternet) }</b></span>) :
              (<span>Piso 1 desde: <b>${ props.tarifaPrimerPisoInternet }</b></span>)
            ) }
            { props.tarifaSegundoPisoInternet && (
              props.tarifaValor && props.tarifaValor.segundoPisoInternet ? 
              (<span>Piso 2 desde: <b>{ clpFormat.format(props.tarifaValor.segundoPisoInternet) }</b></span>) :
              (<span>Piso 2 desde: <b>${ props.tarifaSegundoPisoInternet }</b></span>)
            ) }
          </div>
          <div className="d-flex w-75 mx-auto">
            <button type="button" className="btn btn-primary border-0 mx-auto" onClick={handleOpenPane}>
              Comprar
            </button>
          </div>
        </div>
      </div>
      <LoadingOverlay
        active={isLoading}
        spinner
        text="Tomando asiento..."
        className={styles['grill-detail']}>
        <div className={styles['grill-detail']}>
          <Parrilla
            isShowParrilla={isOpened}
            thisParrilla={props.thisParrilla}
            setIsShowParrilla={setIsOpened}
            asientos1={props.asientos1}
            asientos2={props.asientos2}
            k={props.k}
            parrilla={props}
            stage={props.stage}
            setParrilla={props.setParrilla}
            asientos_selected={props.asientos_selected}
            setIsOpened={setIsOpened}
            setPasaje={props.setPasaje}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setModalMab={props.setModalMab}
          />
        </div>
      </LoadingOverlay>
    </section>
  );
};
export default Boleto;
