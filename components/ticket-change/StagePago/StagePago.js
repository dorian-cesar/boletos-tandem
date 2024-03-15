import axios from "axios";
import { useEffect, useState } from "react";

import { PasajeConvenioDTO } from "dto/PasajesDTO";
import Acordeon from "../../Acordeon/Acordeon";
import ResumenServicio from "./ResumenServicio/ResumenServicio";
import PuntoEmbarque from "./ResumenServicio/PuntoEmbarque/PuntoEmbarque";
import DatosPasajero from "./ResumenServicio/DatosPasajero/DatosPasajero";
import MediosPago from "./ResumenServicio/MediosPago/MediosPago";

import styles from "./StagePago.module.css";
import { ResumenViaje } from "../ResumenViaje/ResumenViaje";

import { useDispatch, useSelector } from "react-redux";
import { asignarDatosComprador } from "store/usuario/compra-slice";

const StagePago = (props) => {
  const {
    carro,
    nacionalidades,
    convenios,
    mediosDePago,
    setCarro,
    boletoValido,
  } = props;

  const informacionAgrupada = useSelector(
    (state) => state.compra.informacionAgrupada
  );
  const datosComprador = useSelector((state) => state.compra.datosComprador);

  const dispatch = useDispatch();

  const [convenioSelected, setConvenioSelected] = useState(null);
  const [convenio, setConvenio] = useState(null);
  const [convenioActive, setConvenioActive] = useState(null);
  const [convenioFields, setConvenioFields] = useState({});
  const [usaDatosPasajeroPago, setUsaDatosPasajeroPago] = useState(false);
  const [mediosPago, setMediosPago] = useState([]);

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

  async function getConvenio() {
    try {
      const convenio_response = await axios.post("/api/ticket_sale/convenio", {
        idConvenio: convenioSelected,
      });
      setConvenio(convenio_response.data);
      setConvenioFields({});
    } catch ({ message }) {
      console.error(`Error al obtener convenio [${message}]`);
    }
  }

  async function validarConvenio() {
    try {
      const pasajes = [
        ...carro.clientes_ida.map(
          (pasajeIda) => new PasajeConvenioDTO(pasajeIda)
        ),
        ...carro.clientes_vuelta.map(
          (pasajeVuelta) => new PasajeConvenioDTO(pasajeVuelta)
        ),
      ];

      const { data } = await axios.post("/api/ticket_sale/validar-convenio", {
        convenio: convenioSelected,
        fields: convenioFields,
        pasajes: pasajes,
      });

      if (data.mensaje == "OK" && Number(data.descuento) > 0) {
        setConvenioActive(data);
      }
    } catch ({ message }) {
      console.error(`Error al validar convenio [${message}]`);
    }
  }

  function convenioField({ name, value }) {
    try {
      let convenioFieldsTemp = { ...convenioFields };
      convenioFieldsTemp[name] = value;
      setConvenioFields(convenioFieldsTemp);
    } catch ({ message }) {
      console.error(`Error al asignar convenio [${message}]`);
    }
  }

  function obtenerPagoConvenioActivo(origen, asiento, piso) {
    try {
      return Number(
        convenioActive.listaBoleto.find(
          (boleto) =>
            boleto.origen == origen &&
            boleto.asiento == asiento &&
            boleto.piso == piso
        )
      );
    } catch ({ message }) {
      console.error(`Error al obtener pago convenio [${message}]`);
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

  function retornarFormularioConvenio() {
    const formularioConvenio = convenio.map(
      (formularioConvenio, indexFormularioConvenio) => (
        <div
          key={`frm-convenio-key-${indexFormularioConvenio}`}
          className="grupo-campos mt-5"
        >
          <label>{formularioConvenio.tipo}</label>
          <input
            onChange={(e) => convenioField(e.target)}
            value={convenioFields[formularioConvenio.tipo]}
            type={formularioConvenio.tipoInput}
            name={formularioConvenio.tipo}
            className="form-control"
          />
        </div>
      )
    );
    return (
      <>
        {formularioConvenio}
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
    );
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

  async function obtenerMediosPagos() {
    try {
      const res = await axios.post(
        "/api/ticket_sale/obtener-medios-pago",
        {}
      );
      if (res.request.status) {
          setMediosPago(res.data);
      }
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    (async () => await obtenerMediosPagos())();
  }, []);

  useEffect(() => {
    (async () => await getConvenio())();
  }, [convenioSelected]);

  return (
    <main className={styles["main-content"]}>
      <section className={styles["info-list"]}>
        <ResumenServicio />
        <Acordeon title="Datos del comprador" open={ true }>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value={usaDatosPasajeroPago}
              id="flexCheckDefault"
              onChange={() => setUsaDatosPasajeroPago(!usaDatosPasajeroPago)}
            />
            <label className="form-check-label" htmlFor="flexCheckDefault">
              Usar los datos del pasajero 1
            </label>
          </div>
          <DatosPasajero asiento={datosComprador} />
        </Acordeon>
        <Acordeon title="Medio de pago" open={ true }>
          <MediosPago mediosPago={mediosPago} setMediosPago={setMediosPago} />
        </Acordeon>
      </section>
      <section className={styles["travel-summary"]}>
        <ResumenViaje boletoValido={boletoValido} />
      </section>
    </main>
  );
};

export default StagePago;
