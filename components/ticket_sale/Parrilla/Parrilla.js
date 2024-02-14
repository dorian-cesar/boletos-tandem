import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  BuscarPlanillaVerticalDTO,
  BuscarPlanillaVerticalOpenPaneDTO,
} from "dto/MapaAsientosDTO";
import { LiberarAsientoDTO, TomaAsientoDTO } from "dto/TomaAsientoDTO";
import styles from "./Parrilla.module.css";
import { AsientoDTO } from "dto/AsientoDTO";

import { useSelector, useDispatch } from 'react-redux'
import { agregarServicio, eliminarServicio } from "store/usuario/compra-slice";
import { toast } from "react-toastify";

const ASIENTO_LIBRE = 'libre';
const ASIENTO_LIBRE_MASCOTA = 'pet-free';
const STAGE_BOLETO_IDA = 0;
const STAGE_BOLETO_VUELTA = 1;
const ASIENTO_TIPO_MASCOTA = 'pet';
const ASIENTO_TIPO_ASOCIADO = 'asociado';
const ASIENTO_OCUPADO = 'ocupado';
const MAXIMO_COMPRA_ASIENTO = 4;

const Parrilla = (props) => {

  const carroCompras = useSelector((state) => state.compra?.listaCarrito) || []
  const dispatch = useDispatch()

  const {
    isShowParrilla = false,
    parrilla,
    stage,
    setParrilla,
    asientos_selected,
  } = props;

  const [asientosIda, setAsientosIda] = useState([]);
  const [asientosVuelta, setAsientosVuelta] = useState([]);
  const [modalMab, setModalMab] = useState(false);
  const [openPane, setOpenPane] = useState(false);
  const [key, setKey] = useState(null);

  useEffect(() => {
    if (isShowParrilla && !parrilla.length) {
      setOpenPaneRoot(props.k);
    }
  }, [isShowParrilla]);

  useEffect(() => {
    if( stage === STAGE_BOLETO_IDA ) {
      setKey(`${props?.thisParrilla?.idTerminalOrigen}-${props?.thisParrilla?.idTerminalDestino}`);
    } else if( stage === STAGE_BOLETO_VUELTA ) {
      setKey(`${props?.thisParrilla?.idTerminalDestino}-${props?.thisParrilla?.idTerminalOrigen}`);
    }
  }, [])

  const [piso, setPiso] = useState(1);

  const totalPagar = carroCompras[key] && carroCompras[key][stage === 0 ? 'ida' : 'vuelta'] ? carroCompras[key][stage === 0 ? 'ida' : 'vuelta'].reduce((a, b) => a + b.asiento.valorAsiento, 0) : 0;
  
  const asientosPorServicio = carroCompras[key] && carroCompras[key][stage === 0 ? 'ida' : 'vuelta'] ? carroCompras[key][stage === 0 ? 'ida' : 'vuelta'] : [];

  function obtenerAsientosSeleccionados(indexParrilla) {
    const returnedArray = []
    if( carroCompras[key] ) {
      if( carroCompras[key][stage === 0 ? 'ida' : 'vuelta'] ) {
        carroCompras[key][stage === 0 ? 'ida' : 'vuelta'].filter((carro) => {
          if( carro.servicio.idServicio === parrilla.parrilla[indexParrilla].idServicio && carro.servicio.fechaServicio === parrilla.parrilla[indexParrilla].fechaServicio ) {
            returnedArray.push({
              ...carro.asiento,
              estado: carro.asiento.tipo !== 'pet' ? 'seleccion' : 'seleccion-mascota'
            });
          }
        });
      }
    }

    return returnedArray;
  }

  const asientoClass = (asiento, indexParrilla) => {
    try {
      let asientosSeleccionados = obtenerAsientosSeleccionados(indexParrilla) || [];

      let isSelected = false, isPetSelected = false;

      if ( asientosSeleccionados.length > 0 ) {
        const findAsiento = asientosSeleccionados.find((i) => i.asiento === asiento.asiento);
        if( findAsiento ) {
          asiento = findAsiento;
        }
        isSelected = asientosSeleccionados.includes(
          (i) => i.asiento === asiento && asiento.tipo !== "pet-busy"
        );
        isPetSelected = asientosSeleccionados.includes(
          (i) => i.asiento === asiento && asiento.estado === "pet-busy"
        );
      }


      let classes = "";
      if (asiento.estado === 'seleccion') {
        classes += styles['seleccion'] + ' ';
      }

      if (asiento.estado === 'seleccion-mascota') {
        classes += styles['m-seleccion'] + ' ';
      }

      if (asiento.tipo === "pet" && asiento.estado === "ocupado") {
        classes += styles['m-disponible'] + ' ';
      }

      if (asiento.tipo === "pet" && asiento.estado === "pet-free") {
        classes += styles['m-disponible'] + ' ';
      }

      if (
        asiento.estado === "pet-busy" &&
        !asientosSeleccionados.find((i) => i.asiento === asiento.asiento)
      ) {
        classes += styles['m-reservado'] + ' ';
      }
      if (asiento.estado === "ocupado") {
        classes += styles['reservado'] + ' ';
      }
      if (asiento.estado === "libre") {
        classes += styles['disponible'] + ' ';
      }

      if (asiento.asiento === "B1" || asiento.asiento === "B2") {
        classes += styles['bano'] + ' ';
      }

      return classes.trim();
    } catch( error ) {
      console.log(`Error al obtener clases para el asiento ${ JSON.stringify(asiento) }`)
      console.log(obtenerAsientosSeleccionados(indexParrilla))
      console.error(`Error al obtener clases de asiento [${ error }]`);
    }
  };

  async function reloadPane(indexParrilla) {
    try {
      const parrillaTemporal = [...parrilla.parrilla];
      const { data } = await axios.post(
        "/api/ticket_sale/mapa-asientos",
        new BuscarPlanillaVerticalOpenPaneDTO(parrilla)
      );
      let nuevaParrilla = { ...parrillaTemporal[indexParrilla] };
      nuevaParrilla.loadingAsientos = false;
      nuevaParrilla.asientos1 = data[1];
      if( !!parrillaTemporal[indexParrilla].busPiso2 ) {
        nuevaParrilla.asientos2 = data[2];
      }
      parrillaTemporal[indexParrilla] = nuevaParrilla;
      setParrilla(parrillaTemporal);
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
      debugger;
      if( asiento.estado === 'sinasiento' || !asiento.asiento ) return;

      const carrito = {
        servicio: parrilla.parrilla[indexParrilla],
        asiento,
        tipoServicio: (stage === 0) ? 'ida' : 'vuelta'
      }

      let asientosTemporal = asientosPorServicio || [];
      asientosTemporal = asientosTemporal.filter((temporal) => temporal.servicio.idServicio === parrilla.parrilla[indexParrilla].idServicio && temporal.servicio.fechaServicio === parrilla.parrilla[indexParrilla].fechaServicio);
      asientosTemporal = asientosTemporal.map((temporal) => temporal.asiento);
      
      const asientoSeleccionado = asientosTemporal?.find(
        (asientoBusqueda) => asiento.asiento == asientoBusqueda?.asiento
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

        dispatch(agregarServicio(carrito));
        await reloadPane(indexParrilla);
        return;
      }

      if( asiento.estado == ASIENTO_OCUPADO ) {
        if( asientoSeleccionado ) {
          await servicioLiberarAsiento(
            carrito,
            asiento.asiento,
            1, 
            piso
          );
  
          if (
            asiento.tipo == ASIENTO_TIPO_ASOCIADO ||
            asiento.tipo == ASIENTO_TIPO_MASCOTA
          ) {
            await servicioLiberarAsiento(
              carrito,
              asiento.asientoAsociado,
              1,
              piso
            );
          }
          dispatch(eliminarServicio(carrito));
          await reloadPane(indexParrilla);
          return;
        }
        return;
      }
    } catch ({ message }) {
      console.error(`Error al tomar asiento [${message}]`);
    }
  }

  async function servicioLiberarAsiento(parrillaServicio, asiento, codigoReserva, piso) {
    try {    
        const { data } = await axios.post('/api/ticket_sale/liberar-asiento', new LiberarAsientoDTO(parrillaServicio, asiento, codigoReserva, piso))
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

  function getImage( sit, indexParrilla ) {
    let asientosSeleccionados = obtenerAsientosSeleccionados(indexParrilla) || [];

    if ( asientosSeleccionados.length > 0 ) {
      const findAsiento = asientosSeleccionados.find((i) => i.asiento === sit.asiento);
      if( findAsiento ) sit = findAsiento;
    }
    
    if( sit.asiento === 'B1' || sit.asiento === 'B2') {
      return 'img/a-bano.svg';
    }
    if( sit.clase && sit.estado === 'seleccion' ) {
      return 'img/asiento_seleccionado.svg';
    }
    if( sit.estado === 'libre' && sit.valorAsiento > 0) {
      return 'img/asiento_disponible.svg';
    }
    if( sit.clase && sit.estado === 'ocupado' ) {
      return 'img/asiento_ocupado.svg';
    }
    if( sit.estado === 'libre' && sit.valorAsiento === 0) {
      return '';
    }
  }

  function cantidadAsientosSeleccionados() {
    return asientosPorServicio.filter((i) => i.servicio.idServicio === props.thisParrilla.idServicio && i.servicio.fechaServicio === props.thisParrilla.fechaServicio).length;
  }

  return (
    isShowParrilla && (
      <section className={styles["grill-detail"]}>
        <div className={styles["cross-container"]}>
          <img
            src="img/close.svg"
            className={styles["cross"]}
            onClick={() => props.setIsOpened(false)}
          />
        </div>
        <div className={ styles['disponibilidad-bus'] }>
          <div className={`${styles["bus"]} ${styles["piso-1"]}`}>
            { piso === 1 && <img
              src="img/line.svg"
              alt="piso-1"
              className={styles["linea-piso-1"]}
            />}
            <div className={ styles['contenedor-bus'] }>
              {piso === 1 && <div className={styles["fila"]}>
                <img
                  className={styles["imagen-volante"]}
                  src="img/volante.svg"
                  alt="Volante conductor"
                />
              </div>}
              <div className={ `${ styles["fila"] } ${ styles['fila-vacia'] }`}>
                <div className={styles["columna"]}></div>
                <div className={styles["columna"]}></div>
                <div className={styles["columna"]}></div>
                <div className={styles["columna"]}></div>
                <div className={styles["columna"]}></div>
              </div>
              {props.asientos1 ? (
                piso === 1 &&
                <>
                  {function () {
                    let max = 7 - props.asientos1.length;
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
                                  1
                                );
                              }}
                              className={`${styles["columna"]} ${ asientoClass(ii, props.k) } `}
                            >
                              { ii.asiento && <img src={ getImage(ii, props.k) }/> }
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
                    let max = 7 - props.asientos1.length;
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
              {props.asientos2 ? (
                piso === 2 &&
                <>
                  {props.asientos2.map((i, k) => {
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
                                  1
                                );
                              }}
                              className={`${styles["columna"]} ${ asientoClass(ii, props.k) } `}
                            >
                              { ii.asiento && <img src={ getImage(ii, props.k) }/> }
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
                    let max = 10 - props.asientos2.length;
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
          </div>
          <div className={ styles['estados-disponibilidad'] }>
            <div>
              <div className={styles["asiento-disponible"]}></div>
              <span>Disponible</span>
            </div>
            <div>
              <div className={styles["asiento-seleccionado"]}></div>
              <span>Seleccionado</span>
            </div>
            <div>
              <div className={styles["asiento-reservado"]}></div>
              <span>Reservado</span>
            </div>
          </div>
        </div>
        <div className={ styles['botones-inferiores'] }>
          <div className={ styles['botones-seleccion-piso'] }>
            <div className={ styles['seleccion-pisos']}>
              <div className={ `${ styles["floor-button"] } ${ piso === 1 && styles["floor-button-selected"] }` } onClick={ () => setPiso(1) }>
                <span>#Piso 1</span>
              </div>
              <div className={ `${ styles["floor-button"] } ${ piso === 2 && styles["floor-button-selected"] }` } onClick={ () => setPiso(2) }>
                <span>#Piso 2</span>
              </div>
            </div>
          </div>
          <div className={ styles['botones-pago'] }>
            <div className={styles["button_continue"]}  href="#"
                     onClick={(e) => {
                        e.stopPropagation();
                        props.setPasaje(props);
                      }}>
              <span>Continuar: ${ totalPagar }</span>
            </div>
            <div className={styles["button_little_car"]}>
              <span>Agregar al carro</span>
            </div>
            <div className={ styles['texto-cantidad-asientos'] }>
              <span>Cantidad de asientos seleccionados: { cantidadAsientosSeleccionados() }</span>
            </div>
          </div>
        </div>
      </section>
    )
  );
};

export default Parrilla;
