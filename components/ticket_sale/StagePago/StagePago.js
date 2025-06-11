import axios from "axios";
import { useEffect, useState } from "react";

import { PasajeConvenioDTO } from "dto/PasajesDTO";
import Acordeon from "../../Acordeon/Acordeon";
import ResumenServicio from "./ResumenServicio/ResumenServicio";
import PuntoEmbarque from "./ResumenServicio/PuntoEmbarque/PuntoEmbarque";
import DatosPasajero from "./ResumenServicio/DatosPasajero/DatosPasajero";
import MediosPago from "./ResumenServicio/MediosPago/MediosPago";
import Convenio from "./ResumenServicio/Convenio/Convenio";

import styles from "./StagePago.module.css";
import { ResumenViaje } from "../ResumenViaje/ResumenViaje";

import { useDispatch, useSelector } from "react-redux";
import { asignarDatosComprador } from "store/usuario/compra-slice";

import LocalStorageEntities from "entities/LocalStorageEntities";
import { decryptData } from "utils/encrypt-data";
import { ToastContainer } from "react-toastify";

const StagePago = (props) => {
  const { carro, nacionalidades, convenios, mediosDePago, setCarro } = props;

  const informacionAgrupada = useSelector(
    (state) => state.compra.informacionAgrupada
  );
  const datosComprador = useSelector((state) => state.compra.datosComprador);

  const dispatch = useDispatch();
  const [mediosPago, setMediosPago] = useState([]);

  const [convenioSelected, setConvenioSelected] = useState(null);
  const [convenio, setConvenio] = useState(null);
  const [convenioActive, setConvenioActive] = useState(null);
  const [convenioFields, setConvenioFields] = useState({});
  const [usaDatosPasajeroPago, setUsaDatosPasajeroPago] = useState(false);
  const [codigoCuponera, setCodigoCuponera] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [convenioActivos, setConvenioActivos] = useState([]);
  const [descuentoConvenio, setDescuentoConvenio] = useState(null);
  const [requestConvenio, setRequestConvenio] = useState(null);

  useEffect(() => {
    const localUser = decryptData(LocalStorageEntities.user_auth);
    setUsuario(localUser);
  }, []);

  useEffect(() => {
    if (usaDatosPasajeroPago) {
      dispatch(asignarDatosComprador(informacionAgrupada[0].asientos[0]));
    } else {
      dispatch(
        asignarDatosComprador({
          nombre: "",
          apellido: "",
          email: "",
          rut: "",
          tipoDocumento: "R",
        })
      );
    }
  }, [usaDatosPasajeroPago]);

  async function obtenerMediosPagos() {
    try {
      const res = await axios.post("/api/ticket_sale/obtener-medios-pago", {});
      if (res.request.status) {
        setMediosPago(res.data);
      }
    } catch (e) {}
  }

  async function getConvenio() {
    try {
      const convenio_response = await axios.post("/api/convenio/obtener-convenios", {});
      setConvenioActivos(convenio_response.data?.Convenio);
    } catch ({ message }) {
      console.error(`Error al obtener convenio [${message}]`);
    }
  }

  function getSubtotal(clientes, clean) {
    try {
      return clientes.reduce(
        (valorAcumulado, { tarifa, origen, asiento, piso }) => {
          tarifa = tarifa.replace(".", ",");
          const precio =
            !clean && convenioActive
              ? obtenerPagoConvenioActivo(origen, asiento, piso)
              : Number(tarifa.replace(/[^\d.-]/g, ""));
          valorAcumulado += precio;
          return valorAcumulado;
        },
        0
      );
    } catch ({ message }) {
      console.error(`Error al obtener el sub total [${message}]`);
    }
  }

  function obtenerCantidadAsientos(tipoClientes) {
    const listaServicios = carro[tipoClientes].reduce(
      (valorInicial, valorActual) => {
        if (!valorInicial[valorActual.servicio]) {
          valorInicial[valorActual.servicio] = [];
        }
        valorInicial[valorActual.servicio].push(valorActual);
        return valorInicial;
      },
      {}
    );
    return Object.keys(listaServicios).map((servicio) => (
      <>
        <div className="row">
          <div className="col-8">
            <h4>
              {listaServicios[servicio].length}X boleto {servicio}
            </h4>
          </div>
          <div className="col-4 d-flex justify-content-end">
            <h3>
              ${getSubtotal(listaServicios[servicio]).toLocaleString("es")}
            </h3>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <p>Precio Normal</p>
          </div>
          <div className="col-4 d-flex justify-content-end">
            <h4 className="tachado">
              $
              {(
                Math.round(
                  (getSubtotal(listaServicios[servicio], true) * 1.12) / 100
                ) * 100
              ).toLocaleString("es")}
            </h4>
          </div>
        </div>
      </>
    ));
  }


  useEffect(() => {
    (async () => await obtenerMediosPagos())();
  }, []);

  // useEffect(() => {
  //   (async () => await getConvenio())();
  // }, []);

  return (
    <main className={ `${ styles["main-content"] } pt-2` }>
      <section className={styles["info-list"]}>
        <ResumenServicio open={true} nacionalidades={ nacionalidades }/>
        <Acordeon title="Datos del comprador" open={true}>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value={usaDatosPasajeroPago}
              id="flexCheckDefault"
              disabled={ usuario }
              onChange={() => setUsaDatosPasajeroPago(!usaDatosPasajeroPago)}
            />
            <label className="form-check-label" htmlFor="flexCheckDefault">
              Usar los datos del pasajero 1
            </label>
          </div>
          <DatosPasajero asiento={datosComprador} usuario={ usuario }/>
        </Acordeon>
        {/* <Acordeon title="Convenios" open={true}>
            <Convenio
              convenioActivos={convenioActivos}
              descuentoConvenio={descuentoConvenio}
              setDescuentoConvenio={setDescuentoConvenio}
              convenio={convenio} 
              setConvenio={setConvenio}
              requestConvenio={requestConvenio}
              setRequestConvenio={setRequestConvenio}
            />
        </Acordeon> */}
        <Acordeon title="Medio de pago" open={true}>
          <MediosPago
            setMediosPago={setMediosPago}
            mediosPago={mediosPago}
            codigoCuponera={codigoCuponera}
            setCodigoCuponera={setCodigoCuponera}
          />
        </Acordeon>
      </section>
      <section className={styles["travel-summary"]} title="Resumen del viaje" >
        <ResumenViaje
          codigoCuponera={codigoCuponera}
          setCodigoCuponera={setCodigoCuponera}
          descuentoConvenio={descuentoConvenio}
          setDescuentoConvenio={setDescuentoConvenio}
          convenio={convenio} 
          setConvenio={setConvenio}
          requestConvenio={requestConvenio}
          setRequestConvenio={setRequestConvenio}
        />
      </section>
      <ToastContainer />
    </main>
    
  );
};

export default StagePago;
