import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import Boleto from "../Boleto/Boleto";
import Loader from "../../Loader";

import { BuscarPlanillaVerticalDTO } from "dto/MapaAsientosDTO";
import { PasajeDTO } from "dto/PasajesDTO";
import { FiltroServicios } from "../FiltroServicios/FiltroServicios";
import styles from "./StagePasajes.module.css";
import moment from "moment";

import CryptoJS from "crypto-js";

import { generateToken } from "utils/jwt-auth";

const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;

const STAGE_BOLETO_IDA = 0;
const STAGE_BOLETO_VUELTA = 1;

const StagePasajes = (props) => {
  const {
    parrilla,
    stage,
    loadingParrilla,
    setParrilla,
    startDate,
    endDate,
    carro,
    setCarro,
    setStage,
    searchParrilla,
    mascota_allowed = false,
    setModalMab,
  } = props;

  console.log("StagePasajes", props);

  const [filter_tipo, setFilterTipo] = useState([]);
  const [filter_horas, setFilterHoras] = useState([]);
  const [filter_mascota, setFilterMascota] = useState([]);
  const [openPane, setOpenPane] = useState(false);
  const [sort, setSort] = useState(null);
  const [mascotaAllowed, setMascotaAllowed] = useState(mascota_allowed);
  const [asientosIda, setAsientosIda] = useState([]);
  const [asientosVuelta, setAsientosVuelta] = useState([]);
  const [servicioIda, setServicioIda] = useState(null);
  const [servicioVuelta, setServicioVuelta] = useState(null);
  const [servicios, setServicios] = useState(null);

  const toggleTipo = useCallback(
    (tipo) => {
      let listaTipoTemporal = [...filter_tipo];
      if (filter_tipo.includes(tipo)) {
        listaTipoTemporal = filter_tipo.filter((i) => i !== tipo);
      } else {
        listaTipoTemporal.push(tipo);
      }
      setFilterTipo(listaTipoTemporal);
    },
    [filter_tipo]
  );

  const toggleHoras = useCallback(
    (horas) => {
      let listaHorasTemporal = [...filter_horas];
      if (filter_horas.includes(horas)) {
        listaHorasTemporal = listaHorasTemporal.filter((i) => i !== horas);
      } else {
        listaHorasTemporal.push(horas);
      }
      setFilterHoras(listaHorasTemporal);
    },
    [filter_horas]
  );

  const tipos_servicio = parrilla.reduce((a, b) => {
    if (!a.includes(b.servicioPrimerPiso) && b.servicioPrimerPiso != "") {
      a.push(b.servicioPrimerPiso);
    }
    if (!a.includes(b.servicioSegundoPiso) && b.servicioSegundoPiso != "") {
      a.push(b.servicioSegundoPiso);
    }
    return a;
  }, []);

  async function setOpenPaneRoot(indexParrilla) {
    try {
      // ╰(*°▽°*)╯
      const parrillaTemporal = [...parrilla];
      const parrillaModificada = [...parrilla];
      parrillaTemporal[indexParrilla].loadingAsientos = true;
      await liberarAsientosPanel();
      setParrilla(parrillaTemporal);
      stage == STAGE_BOLETO_IDA ? setAsientosIda([]) : setAsientosVuelta([]);
      if (parrilla[indexParrilla].id == openPane) {
        setOpenPane(null);
        return;
      }
      setOpenPane(parrilla[indexParrilla].id);

      const token = generateToken();

      const request = CryptoJS.AES.encrypt(
        JSON.stringify(
          new BuscarPlanillaVerticalDTO(
            parrillaTemporal[indexParrilla],
            stage,
            startDate,
            endDate,
            parrilla[indexParrilla]
          )
        ),
        secret
      );

      const response = await fetch(`/api/ticket_sale/mapa-asientos`, {
        method: "POST",
        body: JSON.stringify({ data: request.toString() }),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      parrillaModificada[indexParrilla].loadingAsientos = false;
      parrillaModificada[indexParrilla].asientos1 = data[1];
      if (!!parrillaTemporal[indexParrilla].busPiso2) {
        parrillaModificada[indexParrilla].asientos2 = data[2];
      }
      setParrilla(parrillaModificada);
    } catch ({ message }) {
      console.error(`Error al abrir el panel [${message}]`);
    }
  }

  function setPasaje(pasaje) {
    try {
      let carroTemporal = { ...carro };
      if (stage == STAGE_BOLETO_IDA) {
        carroTemporal.clientes_ida = asientosIda.map(
          (asientoIdaMapped, asientoIdaIndex) =>
            new PasajeDTO(
              pasaje,
              asientoIdaMapped,
              asientoIdaIndex == 0 ? true : false
            )
        );
        carroTemporal.pasaje_ida = pasaje;
        setStage(1);
        setCarro(carroTemporal);
        setOpenPane(null);
        // TODO: Descomentar si falla en produccion
        // searchParrilla(1);
      }
      if (stage == STAGE_BOLETO_VUELTA) {
        carroTemporal.clientes_vuelta = asientosVuelta.map(
          (asientoVueltaMapped, asientoVueltaIndex) =>
            new PasajeDTO(
              pasaje,
              asientoVueltaMapped,
              asientoVueltaIndex == 0 ? true : false
            )
        );
        carroTemporal.pasaje_vuelta = pasaje;
        setStage(2);
        setCarro(carroTemporal);
      }
    } catch ({ message }) {
      console.error(`Error al guardar pasaje [${message}]`);
    }
  }

  function returnSortedParrilla() {
    return parrilla.sort((prevValue, actValue) => {
      if (!sort) return 1;

      if (sort == "precio-up")
        return (
          prevValue.tarifaPrimerPisoInternet - actValue.tarifaPrimerPisoInternet
        );

      if (sort == "precio-down")
        return (
          actValue.tarifaPrimerPisoInternet - prevValue.tarifaPrimerPisoInternet
        );

      if (sort == "hora-up")
        return (
          Number(prevValue.departureTime.replace(":", "")) -
          Number(actValue.departureTime.replace(":", ""))
        );

      return (
        Number(actValue.departureTime.replace(":", "")) -
        Number(prevValue.departureTime.replace(":", ""))
      );
    });
  }

  function returnMappedParrilla() {
    let sortedParrilla = [];
    returnSortedParrilla().map((mappedParrilla, indexParrilla) => {
      if (
        filter_tipo.length > 0 &&
        !filter_tipo.includes(mappedParrilla.servicioPrimerPiso) &&
        !filter_tipo.includes(mappedParrilla.servicioSegundoPiso)
      )
        return;

      if (mascotaAllowed && mappedParrilla.mascota == 0) return;

      if (filter_horas.length > 0) {
        const horaSalida = moment(mappedParrilla.departureTime, "hh:mm");

        let isTime = filter_horas.some((horaFiltro) => {
          let [inicio, fin] = horaFiltro.split("-");
          const horaInicio = moment(inicio, "hh:mm");
          const horaFin = moment(fin, "hh:mm");

          return horaSalida >= horaInicio && horaSalida <= horaFin;
        });

        if (!isTime) return;
      }

      sortedParrilla.push(
        <Boleto
          key={`key-boleto-${indexParrilla}`}
          {...mappedParrilla}
          thisParrilla={mappedParrilla}
          k={indexParrilla}
          asientos_selected={
            stage == STAGE_BOLETO_IDA ? asientosIda : asientosVuelta
          }
          stage={stage}
          setPasaje={setPasaje}
          setOpenPane={setOpenPaneRoot}
          parrilla={parrilla}
          setParrilla={setParrilla}
          setModalMab={setModalMab}
        />
      );
    });

    if (sortedParrilla.length > 0) {
      setServicios(sortedParrilla);
    } else {
      setServicios(
        <div className="h-100 justify-content-center align-content-center">
          <div className="m-auto text-center">
            Lo sentimos, no existen resultados para su búsqueda, intente con
            otro horario.
          </div>
        </div>
      );
    }
  }

  useEffect(() => {
    returnMappedParrilla();
  }, [toggleTipo, toggleHoras, mascotaAllowed, parrilla]);

  return (
    <div className="container py-2">
      <div className="mb-2 d-flex d-lg-none justify-content-between align-content-center">
        <button
          className="border-0 bg-white rounded text-secondary fw-bold d-flex gap-1 p-1"
          type="button"
          data-bs-toggle="modal"
          data-bs-target={`#filtroModal`}
        >
          <img
            src="img/ui/service-components/settings-outline.svg"
            width={24}
            height={24}
          />
          Filtros
        </button>
        <label>{servicios?.length || 0} resultados</label>
      </div>
      <div className="row justify-content-center gap-2">
        <div className="d-none d-lg-block d-xl-block d-xxl-block col-12 col-md-3 col-lg-3 col-xl-3">
          <FiltroServicios
            tipos_servicio={tipos_servicio}
            filter_tipo={filter_tipo}
            filter_horas={filter_horas}
            filter_mascota={filter_mascota}
            stage={stage}
            toggleTipo={toggleTipo}
            toggleHoras={toggleHoras}
            mascota_allowed={mascotaAllowed}
            setMascota={setMascotaAllowed}
          />
        </div>
        <div className="col d-flex flex-col gap-3">
          {loadingParrilla ? (
            <Loader />
          ) : parrilla.length > 0 ? (
            servicios
          ) : (
            <div className="h-100 justify-content-center align-content-center">
              <div className="m-auto text-center">
                Lo sentimos, no existen resultados para su búsqueda, intente con
                otro horario.
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        className="modal fade"
        id={`filtroModal`}
        tabIndex={-1}
        aria-labelledby="filtroModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header border border-0">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="d-flex flex-col">
              <FiltroServicios
                tipos_servicio={tipos_servicio}
                filter_tipo={filter_tipo}
                filter_horas={filter_horas}
                filter_mascota={filter_mascota}
                stage={stage}
                toggleTipo={toggleTipo}
                toggleHoras={toggleHoras}
                mascota_allowed={mascotaAllowed}
                setMascota={setMascotaAllowed}
              />
              <button
                className="btn btn-primary w-75 my-3 mx-auto rounded-3 fw-bold"
                data-bs-dismiss="modal"
              >
                Filtrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StagePasajes;
