import dayjs from "dayjs";
import { useState } from "react";
import styles from "./Boleto.module.css";
import Parrilla from "../Parrilla/Parrilla";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-flip';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import LoadingOverlay from "react-loading-overlay";


var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
const Boleto = (props) => {
  const [isOpened, setIsOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  let duracion = dayjs(
    props.fechaLlegada + " " + props.horaLlegada,
    "DD/MM/YYYY HH:mm"
  ).diff(
    dayjs(props.fechaSalida + " " + props.horaSalida, "DD/MM/YYYY HH:mm"),
    "minute"
  );

  duracion = Math.floor(duracion / 60) + " hrs " + (duracion % 60) + " min";

  return (
    <>
      <section className={ styles['container-ticket'] }>
        <input type="checkbox" checked={isOpened} readOnly/>
        <div className={ styles['ticket'] }>
          <input type="checkbox" checked={isOpened} readOnly/>
          <div className={ styles['ticket-details'] }>
            <div className={ styles['ticket-details__header'] }>
              <img src="img/logo-pullmanbus.svg" />
              { props.mascota == '1' && <img src="img/icon/logos/paw-outline.svg" />}
            </div>
            <div className={ styles['ticket-details__travel'] }>
              <div className={ styles['ticket-details__travel-detail'] }>
                <span className={ styles['bold'] }>{ props.horaSalida }</span>
                <span className={ styles['bold'] }>{ props.terminalSalida }</span>
                <span>{ props.fechaSalida }</span>
              </div>
              <div className={ styles['ticket-details__travel-detail'] }>
                <span>Duración</span>
                <span className={ styles['bold'] }>{ duracion }</span>
                <a className={ styles['link'] } onClick={ () => console.log('PROPS:::', props) }>Itinerario</a>
              </div>
              <div className={ styles['ticket-details__travel-detail'] }>
                <span className={ styles['bold'] }>{ props.horaLlegada }</span>
                <span className={ styles['bold'] }>{ props.terminalDestino }</span>
                <span>{ props.fechaLlegada }</span>
              </div>
            </div>
          </div>
          <div className={ styles['ticket-price'] }>
            <div className={ styles['ticket-price__detail'] }>
            </div>
            <button onClick={() => setIsOpened(!isOpened)}>
              Comprar
            </button>
          </div>
          <div className={ styles['animated-logo'] }>
            <img src="img/icon-barra.svg" />
          </div>
        </div>
        <LoadingOverlay
          active={ isLoading }
          spinner
          text="Tomando asiento..."
          className={ styles['grill-detail'] }>
          <div className={ styles['grill-detail'] }>
            <Parrilla 
              isShowParrilla={ isOpened }
              thisParrilla={ props.thisParrilla }
              setIsShowParrilla= { setIsOpened }
              asientos1={ props.asientos1 }
              asientos2={ props.asientos2 }
              k={ props.k }
              parrilla={props}
              stage={props.stage}
              setParrilla={props.setParrilla}
              asientos_selected={props.asientos_selected}
              setIsOpened={setIsOpened}
              setPasaje={props.setPasaje}
              isLoading={ isLoading }
              setIsLoading={ setIsLoading }
              />
          </div>
        </LoadingOverlay>
      </section>
    </>
  );
};
export default Boleto;
