import styles from "./ParrillaCuponera.module.css";
import React from "react";
import { useSelector, useDispatch } from 'react-redux'
import { agregarCuponera } from "../../../store/usuario/compra-cuponera-slice";

const ParrillaCuponera = (props) => {
  const { parrilla, stage, setStage } = props;
  const dispatch = useDispatch();

  const renderRows = () => {
    const rows = [];

    for (let i = 0; i < parrilla.length; i += 3) {
      const rowElements = [];
      for (let j = i; j < i + 3 && j < parrilla.length; j++) {
        const cuponera = parrilla[j];
        rowElements.push(
          <div key={j} className="col-12 col-md-6 col-lg-4">
            {
              <div className={styles["container"]}>
                <div className={"row"}>
                  <div className={styles["title"]}>
                    <img
                      className={styles["img-little"]}
                      src="../img/icon/cuponera/ticket-outline.svg"
                    />
                    {cuponera.nombreCuponera}
                  </div>
                  <div className={styles["sub-title"]}>Servicio</div>
                  <div className={styles["sub-title-origen"]}>
                    {cuponera.origenDescripcion}{" "}
                    <img
                      className={styles["img-little-origen"]}
                      src="../img/icon/cuponera/repeat-outline.svg"
                    />{" "}
                    {cuponera.destinoDescripcion}
                  </div>
                  <div className={styles["price"]}>
                    $ {cuponera.valorTotalCuponera}
                  </div>
                  <div className={styles["condition"]}>Condiciones: </div>
                  <div className={styles["sub-title-origen"]}>
                    Total Cupones {cuponera.cantidadCupones}
                  </div>
                  <div className={styles["dotted-line"]}></div>
                  <div className={styles["button"]}
                  onClick={() => comprarCuponera(cuponera)}>Seleccionar</div>
                </div>
              </div>
            }
          </div>
        );
      }
      rows.push(
        <div key={i} className="row">
          {rowElements}
        </div>
      );
    }
    return rows;
  };

  function comprarCuponera(cuponera){
    dispatch(agregarCuponera(cuponera))
    setStage(1)
  }

  return <>{renderRows()}</>;
};

export default ParrillaCuponera;
