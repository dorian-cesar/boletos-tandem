import React from "react";
import styles from "./PopupInformativo.module.css";
import ModalEntities from "../../entities/ModalEntities";
import Image from "next/image";

const PopupInformativo = ({ modalClose , modalMethods, modalTitleButton, modalBody = "" }) => {
  return (
      <main className={ styles["popup-overlay"] }>
          <section className={ styles["popup-container"] }>
              <span className={styles["close-icon"]} onClick={modalClose}>&times;</span>
              <div className={"d-flex justify-content-center"}>
                  <img className={ styles["image-content"] } src={'/img/informacion/informacion_servicios.png'} alt={"Aviso de servicios"}/>
              </div>
              <div className={ styles["action-buttons"] }>
                  <button className={styles["popup-button"]} onClick={ modalClose }>
                      Aceptar
                  </button>
              </div>
          </section>
      </main>
  );
};

export default PopupInformativo;
