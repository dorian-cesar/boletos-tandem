import React, { useEffect, useState } from "react";
import { BuscarPlanillaVerticalDTO } from "dto/MapaAsientosDTO";
import styles from "./Parrilla.module.css";

const Parrilla = (props) => {

  const { isShowParrilla = false } = props;

  const [parrilla, setParrilla] = useState([]);

  useEffect(() => {
    if (isShowParrilla && !parrilla.length) {
      setOpenPaneRoot(props.k);
    }
  }, [isShowParrilla])

  const asientoClass = (asiento) => {
      const isSelected = props.asientos_selected.find(
          (i) => i.asiento === asiento.asiento && asiento.tipo !== "pet-busy"
      );
      const isPetSelected = props.asientos_selected.find(
          (i) =>
              i.asiento === asiento.asiento && asiento.estado === "pet-busy"
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

  async function liberarAsientosPanel() {
    if( stage == STAGE_BOLETO_IDA ) {
        asientosIda.forEach(async (asientoIda) => await servicioLiberarAsiento(servicioIda, asientoIda.asiento, asientoIda.piso, asientoIda.codigoReserva));
        setAsientosIda([]);
    }
    if( stage == STAGE_BOLETO_VUELTA ) {
        asientosVuelta.forEach(async (asientoVuelta) => await servicioLiberarAsiento(servicioVuelta, asientoVuelta.asiento, asientoVuelta.piso, asientoVuelta.codigoReserva));
        setAsientosVuelta([]);
    }
  }

  async function setOpenPaneRoot(indexParrilla) {
      
    try {
      // ╰(*°▽°*)╯
      debugger;
      const parrillaTemporal = [...parrilla];
      const parrillaModificada = [...parrilla];
      parrillaTemporal[indexParrilla].loadingAsientos = true;
      await liberarAsientosPanel();
      setParrilla(parrillaTemporal);
      stage == STAGE_BOLETO_IDA ? setAsientosIda([]) : setAsientosVuelta([]);
      if( parrilla[indexParrilla].id == openPane ) {
        setOpenPane(null);
        return;
      }
      setOpenPane(parrilla[indexParrilla].id);
      const { data } = await axios.post('/api/mapa-asientos', 
      new BuscarPlanillaVerticalDTO(parrillaTemporal[indexParrilla], stage, startDate, endDate, parrilla[indexParrilla]));
      console.log('mapa asiento', data)
      parrillaModificada[indexParrilla].loadingAsientos = false;
      parrillaModificada[indexParrilla].asientos1 = data[1];
      if( !!parrillaTemporal[indexParrilla].busPiso2 ) {
        parrillaModificada[indexParrilla].asientos2 = data[2];
      }
      setParrilla(parrillaModificada);
    } catch ({ message }) {
      console.error(`Error al abrir el panel [${ message }]`);
    }
  };

    return (
      isShowParrilla && (
            <section className={styles["grill-detail"]}>
                <div className={styles["cross-container"]}>
                    <img
                        src="img/icon/buttons/close-circle-outline.svg"
                        className={styles["cross"]}
                        onClick={ () => setIsShowParrilla(!isShowParrilla) }
                    />
                </div>
                <div className={`${styles["bus"]} ${styles["piso-1"]}`}>
                    <img
                        src="img/line.svg"
                        alt="piso-1"
                        className={styles["linea-piso-1"]}
                    />
                    <div className={ styles['fila'] }>
                      <img
                        className={ styles['imagen-volante'] }
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
                      { props.asientos1.map((i, k) => {
                        return (
                          <div key={`fila-asiento-${k}`} className="fila">
                            { i.map((ii, kk) => {
                              return (
                                <div
                                  key={`columna-asiento-${kk}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    props.tomarAsiento(ii, props, props.k, 1, props.stage);
                                  }}
                                  className={ `${ styles['columna'] } ${ styles[asientoClass(ii)] }` }
                                >
                                  <span>
                                    {ii.asiento != "B1" &&
                                    ii.asiento != "B2" &&
                                    ii.estado !=
                                        "sinasiento" &&
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
                                            className="fila"
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
          </section>
        )
    );
};

export default Parrilla;
