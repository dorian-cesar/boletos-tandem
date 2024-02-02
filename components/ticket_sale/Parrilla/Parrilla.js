import React from "react";
import styles from "./Parrilla.module.css";

const Parrilla = (props) => {
    const { isShowParrilla = false } = props;

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
  
      return classes.trim(); // Eliminar espacios en blanco adicionales al final
    };

    return (
        isShowParrilla && (
            <section className={styles["grill-detail"]}>
                <div className={styles["cross-container"]}>
                    <img
                        src="img/icon/buttons/close-circle-outline.svg"
                        className={styles["cross"]}
                    />
                </div>
                {/* <div className="bus piso-1"> */}
                <div className={ styles['bus'] }>
                  <img src="img/line.svg" alt="piso-1" className={ styles['linea-piso-1'] }/>
                  <div className={ styles['fila'] }>
                      <div className={ styles['columna'] }></div>
                      <div className={ styles['columna'] }></div>
                      <div className={ styles['columna'] }></div>
                      <div className={ styles['columna'] }></div>
                      <div className={ styles['columna'] }>
                        <img src="img/volante.svg" alt="Volante conductor"/>
                      </div>
                  </div>
                </div>
            </section>
        )
    );
};

export default Parrilla;
