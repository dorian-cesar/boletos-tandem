import styles from "./ParrillaCuponera.module.css";
import React from "react";
import { useSelector, useDispatch } from 'react-redux'
import { agregarCuponera } from "store/usuario/compra-cuponera-slice";

const ParrillaCuponera = (props) => {
  const { parrilla, stage, setStage } = props;
  const dispatch = useDispatch();

  const clpFormat = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  });

  const renderRows = () => {
    const rows = [];

    parrilla.forEach((cuponera) => {
      rows.push(
        <div key={cuponera.id}>
          {
            <div className={styles["container"]}>
              <div className={"row"}>
                <div className={styles["title"]}>
                  <img
                    className={styles["img-little"]}
                    src="../img/icon/cuponera/ticket-outline.svg"
                  />
                  <span>{cuponera.nombreCuponera}</span>
                </div>
                <div className={styles["sub-title"]}>Servicio:</div>
                <div className={styles["sub-title-origen"]}>
                  <span>{cuponera.origenDescripcion}</span>
                  <img
                    className={styles["img-little-origen"]}
                    src="../img/icon/cuponera/repeat-outline.svg"
                  />{" "}
                  <span>{cuponera.destinoDescripcion}</span>
                </div>
                <div className={styles["price"]}>
                  { clpFormat.format(cuponera.valorTotalCuponera) }
                </div>
                <div className={styles["condition"]}>Condiciones: </div>
                <div className={styles["condition-desc"] }>
                  <span>
                    <b>{ cuponera.estadoNominativa ? 'Nominativa' : 'Al portador' }</b>
                  </span>
                  <span>
                    Total Cupones {cuponera.cantidadCupones} { cuponera.cuponesExtras && (<b>+ { `${ cuponera.cuponesExtras } extras` }</b>) }
                  </span>
                  <div className={styles["condition-type"]}>
                    <div>
                      <span>{ cuponera.estadoVentanilla ? '🟢' : '🔴' }</span>
                      <span>Ventanilla</span>
                    </div>
                    <div>
                      <span>{ cuponera.estadoWeb ? '🟢' : '🔴' }</span>
                      <span>Web</span>
                    </div>
                  </div>
                  <span>
                    { `${ cuponera.diasDuracion } días de duración` }
                  </span>
                </div>
                {/* <div className={styles["dotted-line"]}></div> */}
                <div className={styles["button"]}
                onClick={() => comprarCuponera(cuponera)}>Seleccionar</div>
              </div>
            </div>
          }
        </div>
      );
    
    });

    return (
      <section className={ styles['contenedor-cuponeras'] }>
        { rows }
      </section>
    );
  };

  function comprarCuponera(cuponera){
    dispatch(agregarCuponera(cuponera))
    setStage(1)
  }

  return <>{renderRows()}</>;
};

export default ParrillaCuponera;
