import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  BuscarPlanillaVerticalDTO,
  BuscarPlanillaVerticalOpenPaneDTO,
} from "dto/MapaAsientosDTO";
import { LiberarAsientoDTO, TomaAsientoDTO } from "dto/TomaAsientoDTO";
import styles from "./Parrilla.module.css";
import { AsientoDTO } from "dto/AsientoDTO";

const ASIENTO_LIBRE = 'libre';
const ASIENTO_LIBRE_MASCOTA = 'pet-free';
const STAGE_BOLETO_IDA = 0;
const STAGE_BOLETO_VUELTA = 1;
const ASIENTO_TIPO_MASCOTA = 'pet';
const ASIENTO_TIPO_ASOCIADO = 'asociado';
const ASIENTO_OCUPADO = 'ocupado';
const MAXIMO_COMPRA_ASIENTO = 4;

const Parrilla = (props) => {
  const {
    isShowParrilla = false,
    parrilla,
    stage,
    setParrilla,
    asientos_selected,
  } = props;

  const [asientosIda, setAsientosIda] = useState([]);
  const [asientosVuelta, setAsientosVuelta] = useState([]);
  const [servicioIda, setServicioIda] = useState(null);
  const [servicioVuelta, setServicioVuelta] = useState(null);
  const [modalMab, setModalMab] = useState(false);
  const [openPane, setOpenPane] = useState(false);

  useEffect(() => {
    if (isShowParrilla && !parrilla.length) {
      setOpenPaneRoot(props.k);
    }
  }, [isShowParrilla]);

  const [piso, setPiso] = useState(1);
  const asientoClass = (asiento) => {
    const isSelected = props.asientos_selected.find(
      (i) => i.asiento === asiento.asiento && asiento.tipo !== "pet-busy"
    );
    const isPetSelected = props.asientos_selected.find(
      (i) => i.asiento === asiento.asiento && asiento.estado === "pet-busy"
    );

    let classes = "";
    if (isSelected) {
      classes += "seleccion ";
    }
    if (isPetSelected) {
      classes += "m-seleccion ";
    }
    if (asiento.tipo === "pet" && asiento.estado === "ocupado") {
      classes += "m-disponible ";
    }
    if (asiento.tipo === "pet" && asiento.estado === "pet-free") {
      classes += "m-disponible ";
    }
    if (
      asiento.estado === "pet-busy" &&
      !props.asientos_selected.find((i) => i.asiento === asiento.asiento)
    ) {
      classes += "m-reservado ";
    }
    if (asiento.estado === "ocupado") {
      classes += "reservado ";
    }
    if (asiento.estado === "libre") {
      classes += "disponible ";
    }
    if (asiento.asiento === "B1" || asiento.asiento === "B2") {
      classes += "bano ";
    }

    return classes.trim();
  };

  async function reloadPane(indexParrilla) {
    try {
      const parrillaTemporal = [...parrilla.parrilla];
      const parrillaModificada = [...parrilla.parrilla];
      const { data } = await axios.post(
        "/api/ticket_sale/mapa-asientos",
        new BuscarPlanillaVerticalOpenPaneDTO(parrilla)
      );
        parrillaModificada[indexParrilla].loadingAsientos = false;
        parrillaModificada[indexParrilla].asientos1 = data[1];
        if( !!parrillaTemporal[indexParrilla].busPiso2 ) {
            parrillaModificada[indexParrilla].asientos2 = data[2];
        }
        setParrilla(parrillaModificada);
    } catch ({ message }) {
        console.error(`Error al recargar panel [${ message }]`);
    }
};

  async function servicioTomarAsiento(
    parrillaServicio,
    asiento,
    piso,
    asientosTemporal,
    isMascota = false
  ) {
    try {
      const { data } = await axios.post(
        "/api/ticket_sale/tomar-asiento",
        new TomaAsientoDTO(
          parrillaServicio,
          '',
          '',
          asiento,
          piso,
          stage
        )
      );
      const reserva = data;
      if (reserva.estadoReserva) {
        if (isMascota) setModalMab(true);
        asientosTemporal.push(
          new AsientoDTO(reserva, parrillaServicio, asiento, piso)
        );
        stage == STAGE_BOLETO_IDA
          ? setAsientosIda(asientosTemporal)
          : setAsientosVuelta(asientosTemporal);
        return asientosTemporal;
      }
    } catch ({ message }) {
      throw new Error(`Error al reservar asociado/mascota [${message}]`);
    }
  }

  async function tomarAsiento(asiento, viaje, indexParrilla, piso) {
    try {
      console.log('asiento datos',asiento)
      let asientosTemporal =
        stage == STAGE_BOLETO_IDA ? [...asientosIda] : [...asientosVuelta];
      const asientoSeleccionado = asientosTemporal.find(
        (asientoBusqueda) => asiento.asiento == asientoBusqueda.asiento
      );

      if (
        asiento.estado == ASIENTO_LIBRE ||
        asiento.estado == ASIENTO_LIBRE_MASCOTA
      ) {
        if (!validarMaximoAsientos(asientosTemporal)) return;
        asientosTemporal = await servicioTomarAsiento(
          parrilla,
          asiento.asiento,
          piso,
          asientosTemporal
        );

        if (
          asiento.tipo == ASIENTO_TIPO_ASOCIADO ||
          asiento.tipo == ASIENTO_TIPO_MASCOTA
        ) {
          asientosTemporal = await servicioTomarAsiento(
            parrilla,
            asiento.asientoAsociado,
            piso,
            asientosTemporal,
            true
          );
        }

        await reloadPane(indexParrilla);
      }

      if (asiento.estado == ASIENTO_OCUPADO && asientoSeleccionado) {
        await servicioLiberarAsiento(
          parrilla.parilla[indexParrilla],
          asiento.asiento,
          asientoSeleccionado.codigoReserva
        );

        if (
          asiento.tipo == ASIENTO_TIPO_ASOCIADO ||
          asiento.tipo == ASIENTO_TIPO_MASCOTA
        ) {
          await servicioLiberarAsiento(
            parrilla.parilla[indexParrilla],
            asiento.asientoAsociado,
            piso,
            asientoSeleccionado.codigoReserva
          );
        }

        await reloadPane(indexParrilla);
        asientosTemporal = asientosTemporal.filter(
          (asientoBusqueda) => asientoBusqueda.asiento != asiento.asiento
        );
        if (
          asiento.tipo == ASIENTO_TIPO_ASOCIADO ||
          asiento.tipo == ASIENTO_TIPO_MASCOTA
        ) {
          asientosTemporal = asientosTemporal.filter(
            ({ asiento }) => asiento != asiento.asientoAsociado
          );
        }
      }

      if (stage == STAGE_BOLETO_IDA) {
        setAsientosIda(asientosTemporal);
        setServicioIda(parrilla.parilla[indexParrilla]);
      } else {
        setAsientosVuelta(asientosTemporal);
        setServicioVuelta(parrilla.parilla[indexParrilla]);
      }
    } catch ({ message }) {
      console.error(`Error al tomar asiento [${message}]`);
    }
  }

  async function servicioLiberarAsiento(parrillaServicio, asiento, piso, codigoReserva) {
    try {
        const { data } = await axios.post('/api/ticket_sale/liberar-asiento', new LiberarAsientoDTO(parrillaServicio, '', '', asiento, piso, stage, codigoReserva))
        return data;
    } catch ({ message }) {
        throw new Error(`Error al liberar asiento [${ message }]`);
    }
}

function validarMaximoAsientos(asientos) {
    if( asientos.length >= MAXIMO_COMPRA_ASIENTO ) {
        toast.warn(`Máximo ${ MAXIMO_COMPRA_ASIENTO } pasajes`, {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false
        });
        return false;
    }
    return true;
}

  async function setOpenPaneRoot(indexParrilla) {
    try {
      const parrillaTemporal = [...parrilla.parrilla];
      const parrillaModificada = [...parrilla.parrilla];

      stage == STAGE_BOLETO_IDA ? setAsientosIda([]) : setAsientosVuelta([]);
      if (parrilla.parrilla[indexParrilla].id == openPane) {
        return;
      }
      const { data } = await axios.post(
        "/api/ticket_sale/mapa-asientos",
        new BuscarPlanillaVerticalOpenPaneDTO(parrilla)
      );
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

  return (
    isShowParrilla && (
      <section className={styles["grill-detail"]}>
        <div className={styles["cross-container"]}>
          <img
            src="img/icon/buttons/close-circle-outline.svg"
            className={styles["cross"]}
            onClick={() => setIsShowParrilla(!isShowParrilla)}
          />
        </div>
        <div className={`${styles["bus"]} ${styles["piso-1"]}`}>
          <img
            src="img/line.svg"
            alt="piso-1"
            className={styles["linea-piso-1"]}
          />
          <div className={styles["fila"]}>
            <img
              className={styles["imagen-volante"]}
              src="img/volante.svg"
              alt="Volante conductor"
            />
          </div>
          <div className={styles["fila"]}>
            <div className={styles["columna"]}></div>
            <div className={styles["columna"]}></div>
            <div className={styles["columna"]}></div>
            <div className={styles["columna"]}></div>
            <div className={styles["columna"]}></div>
          </div>
          {props.asientos1 ? (
            <>
              {props.asientos1.map((i, k) => {
                return (
                  <div key={`fila-asiento-${k}`} className={styles["fila"]}>
                    {i.map((ii, kk) => {
                      return (
                        <div
                          key={`columna-asiento-${kk}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            tomarAsiento(
                              ii,
                              props,
                              props.k,
                              1,
                              props.stage
                            );
                          }}
                          className={`${styles["columna"]} ${
                            styles[asientoClass(ii)]
                          }`}
                        >
                          <span>
                            {ii.asiento != "B1" &&
                            ii.asiento != "B2" &&
                            ii.estado != "sinasiento" &&
                            ii.tipo != "pet"
                              ? ii.asiento
                              : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {function () {
                let max = 10 - props.asientos1.length;
                let n = 0;
                let liens = [];
                while (n < max) {
                  liens.push(
                    <div
                      key={`fila-asiento-${n}`}
                      className={styles["fila"]}
                    ></div>
                  );
                  n++;
                }
                return liens;
              }.call(this)}
            </>
          ) : (
            ""
          )}
        </div>
        <div className={styles["button_first_floor"]}>
          <span>#Piso 1</span>
        </div>
        <div className={styles["button_second_floor"]}>
          <span>#Piso 2</span>
        </div>
        <div className={styles["button_continue"]}>
          <span>Continuar: ${/* valor*/}</span>
        </div>
        <div className={styles["button_little_car"]}>
          <span>Agregar al carro</span>
        </div>
      </section>
    )
  );
};

export default Parrilla;
