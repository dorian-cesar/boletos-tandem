import dayjs from "dayjs";
import { useEffect, useState } from "react";
import Login from "components/Login";
import { useLocalStorage } from "hooks/useLocalStorage";
var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);


const Cuponera = (props) => {
  const { stage, setCuponera, setOpenPane, cuponeraDatos , setCuponeraCompra} = props;

  const [user, setUser] = useState();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [piso, setPiso] = useState(1)
  const [compraDetails, setCompraDetails] = useState(null);
  const { getItem, clear } = useLocalStorage();

  useEffect(() => {
    setUser(getItem("user"));
  }, []);

  const obtenerRespuesta = (condicion) => (condicion ? 'SI' : 'NO');

  function formatearHora(hora) {
    if (!hora || hora.length !== 4) {
      return "Formato de hora incorrecto";
    }

    const horas = parseInt(hora.substring(0, 2), 10);
    const minutos = parseInt(hora.substring(2), 10);

    if (
      isNaN(horas) ||
      isNaN(minutos) ||
      horas < 0 ||
      horas > 23 ||
      minutos < 0 ||
      minutos > 59
    ) {
      return "Hora no válida";
    }
    
    const horaFormateada = `${horas.toString().padStart(2, "0")}:${minutos
      .toString()
      .padStart(2, "0")}`;

    return horaFormateada;
  }

  const handleComprarClick = () => {
      setCompraDetails(props);
      if (props.setCuponeraCompra) {
        props.setCuponera(props)
        props.setCuponeraCompra(props);
      }
  };

  return (
    <div className="cuponera">
      <input type="checkbox" checked={props.openPane == props.id} readOnly />

      <div className="block">
        <div className="content-block">
          <div className="row" onClick={() => props.setOpenPane(props.k)}>
            <div className="col-12 col-md-6 mb-4 mb-md-0">
              <div className="row">
                <div className="hora">Cuponera {props.nombreCuponera}</div>
                <div className="col-4">
                  <div className="hora">{props.horaSalida}</div>
                  <strong>{props.terminalSalida}</strong>
                  <div className="fecha">{props.fechaSalida}</div>
                </div>
                <div className="col-4 text-center">
                  <span>Duración</span>
                  <span className="datos">
                    <strong>
                      {formatearHora(props.horaDesde)} -{" "}
                      {formatearHora(props.horaHasta)}
                    </strong>
                  </span>
                </div>
                <div className="col-12">
                  <div className="barra">
                    <img src="img/icon-barra.svg" />
                  </div>
                </div>
                <div className="col-4">
                  <div className="hora">{props.origenDescripcion}</div>
                  <strong>{props.terminalSalida}</strong>
                  <div className="fecha">{props.fechaSalida}</div>
                </div>
                <div className="col-4"></div>
                <div className="col-4">
                  <div className="hora">{props.destinoDescripcion}</div>
                  <strong>{props.terminalSalida}</strong>
                  <div className="fecha">{props.fechaSalida}</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="row puntitos">
                <div className="col-12 col-md-7">
                  <div className="row mb-4">
                    <div className="col-6">
                      <span>Valor por cupón</span>
                      <strong>{props.valorCupon}</strong>
                    </div>
                    <div className="col-6 text-center d-flex align-items-center">
                      <strong className="precio">Total ${props.valorTotalCuponera}</strong>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-5  d-flex justify-content-center align-center">
                  <div className="px-3 px-md-0 mt-3 mt-md-0 w-100">
                  <a href="#" onClick={(e) => {
                       handleComprarClick()
                      }}className="btn">
            Comprar
          </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="block-2 pt-1 ">
            {props.loadingAsientos ? (
              <h5></h5>
            ) : (
              <div className="seleccion-asiento mt-3">
                <div className="tab-content" id="pills-tabContent">
                  <div
                    className={
                      "tab-pane fade " + (piso == 1 ? "active show" : "")
                    }
                    id="pills-home"
                    role="tabpanel"
                    aria-labelledby="pills-home-tab"
                  >
                    <div className="row">
                      <div className="col-3">
                        <div className="tipo-a">
                        </div>
                        <div className="tipologia">
                          <div>
                            <img src="img/bullet-disponible.svg" />
                            Nominativa - { obtenerRespuesta(props.estadoNominativa)}
                          </div>
                          <div>
                            <img src="img/bullet-elegido.svg" />
                            Ventanilla - { obtenerRespuesta(props.estadoVentanilla)}
                          </div>
                          <div>
                            <img src="img/bullet-reservado.svg" />
                            Web - { obtenerRespuesta(props.estadoWeb)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    
  );
};
export default Cuponera;
