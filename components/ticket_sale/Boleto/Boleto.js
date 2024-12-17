import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import styles from "./Boleto.module.css";
import Parrilla from "../Parrilla/Parrilla";

import ServiceDetail from "@components/sale/ServiceDetail";

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
  const buttonCloseModal = useRef();
  const sitMapButtonRef = useRef();

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
    const screenSize = screen.width;

    if( screenSize <= 425 ) {
      try {
        if( isOpened ) {
          sitMapButtonRef.current.click();
        } else {
          buttonCloseModal.current.click();
        }
      } catch (error) {}
    }
  }, [isOpened])
  
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

  const handleCloseModal = () =>{
    setIsOpened(false);
  } 

  return (
    <section className={ `container bg-white shadow-sm rounded-3 ${ styles["info-container"] }` }>
		  <button ref={ sitMapButtonRef } type="button" className="d-none" data-bs-toggle="modal" data-bs-target={ `#parrillaModal-${props.idServicio}-${props.idTerminalOrigen}${props.idTerminalDestino}` }></button>
      <div className={ `row justify-content-evenly ${ isOpened ? styles["enabled-details"] : "" }` }>
        <div className="d-flex flex-col col px-md-2 py-md-0 p-md-3">
          <div className="d-flex flex-row justify-content-between pt-2 p-md-2">
            <img src="img/ui/service-components/service-logo.svg" className="img-fluid" width={ 150 } height={ 25 } alt="Logo Pullman Bus"/>
            {props.mascota == '1' ? <img src="img/icon/logos/paw-outline.svg" /> : <div></div>}
          </div>
          <div className="row mt-0 mt-md-1 p-2 gap-md-0 justify-content-evenly">
            <div className="row col-12 col-md-4 align-items-center text-center">
              <div className="col-12 col-md-12 d-flex flex-col">
                <span className="fw-bold mb-0 mb-md-2">{props.horaSalida}</span>
              </div>
              <div className="col-12 col-md-12 d-flex flex-col">
                <span className="fw-bold">{props.stage === 0 ? origen?.nombre : destino?.nombre}</span>
                <span className={ `${ styles["travel-terminal-subtitle"] }` }>{props.terminalOrigen}</span>
                {/* <span>{props.fechaSalida}</span> */}
              </div>
            </div>
            <div className="col-12 col-md-4 align-self-center d-flex flex-col text-center align-items-center p-0">
              <span className={`fw-normal d-block d-md-none ${ styles["travel-duration"]}`}>Duración: {duracion}</span>
              <div className="d-none d-md-block">
                <p className="m-0 text-primary fs-6 fw-bold">Duración:</p>
                <span className={ `${ styles["travel-duration"]}` }>{duracion}</span>
              </div>
            </div>
            <div className="row col-12 col-md-4 align-items-center text-center">
              <div className="col-12 col-md-12 d-flex flex-col">
                <span className="fw-bold mb-0 mb-md-2">{props.horaLlegada}</span>
              </div>
              <div className="col-12 col-md-12 d-flex flex-col">
                <span className="fw-bold">{props.stage === 0 ? destino?.nombre : origen?.nombre}</span>
                <span className={ `${ styles["travel-terminal-subtitle"] }` }>{props.terminalDestino}</span>
                {/* <span>{props.fechaLlegada}</span> */}
              </div>
            </div>
          </div>
        </div>
        <div className={ `col-5 col-sm-4 d-flex flex-col p-md-3 p-xl-2 justify-content-between justify-content-md-evenly ${ styles['border-dashed']} gap-3` }>
          <div className={ `d-grid pt-5 p-0 p-md-2 justify-content-center fw-bold gap-2` }>
            { props.tarifaPrimerPisoInternet && (
              props.tarifaValor && props.tarifaValor.primerPisoInternet ? 
              (<div className="d-flex flex-col flex-md-row gap-md-2 text-center">Piso 1 desde: <b className="text-primary">{ clpFormat.format(props.tarifaValor.primerPisoInternet) }</b></div>) :
              (<div className="d-flex flex-col flex-md-row gap-md-2 text-center">Piso 1 desde: <b className="text-primary">${ props.tarifaPrimerPisoInternet }</b></div>)
            ) }
            { props.tarifaSegundoPisoInternet && (
              props.tarifaValor && props.tarifaValor.segundoPisoInternet ? 
              (<div className="d-flex flex-col flex-md-row gap-md-2 text-center">Piso 2 desde: <b className="text-primary">{ clpFormat.format(props.tarifaValor.segundoPisoInternet) }</b></div>) :
              (<div className="d-flex flex-col flex-md-row gap-md-2 text-center">Piso 2 desde: <b className="text-primary">${ props.tarifaSegundoPisoInternet }</b></div>)
            ) }
          </div>
          <div className="d-grid pb-2 pb-md-0">
            <button type="button" className="btn btn-primary border-0 rounded-3" onClick={handleOpenPane}>
              Comprar
            </button>
          </div>
        </div>
      </div>
      <LoadingOverlay
        active={isLoading}
        spinner
        text="Tomando asiento..."
        className={ `${ styles['grill-detail'] }` }>
        <div className={`${ styles['grill-detail'] }`}>
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
            buttonCloseModalRef={buttonCloseModal}
          />
        </div>
      </LoadingOverlay>
      <div className="modal fade" id={ `parrillaModal-${props.idServicio}-${props.idTerminalOrigen}${props.idTerminalDestino}` } tabIndex={ -1 } aria-labelledby="parrillaModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content overflow-y-scroll overflow-x-hidden">
            <div className="modal-header border border-0">
              <button ref={ buttonCloseModal } type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleCloseModal}></button>
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
                  buttonCloseModalRef={buttonCloseModal}
                />
              </div>
            </LoadingOverlay>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Boleto;
