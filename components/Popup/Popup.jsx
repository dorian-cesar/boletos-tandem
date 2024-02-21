import React from "react";
import styles from "./Popup.module.css";
import ModalEntities from "../../entities/ModalEntities";


const Popup = ({ modalKey, modalClose , modalMethods}) => {

  const popInfo = {
    [ModalEntities.email_success]: {
      title: "Correo enviado exitosamente",
      body: "Hemos enviado una contraseña provisional a tu correo electrónico",
      buttonMessage: "Volver al inicio",
      imageIcon: "",
      onClick: () => {
        window.location.href = "/";
      },
    },
    [ModalEntities.register_success]: {
      title: "¡Felicitaciones!",
      body: "Te has registrado exitosamente.",
      buttonMessage: "Ingresar",
      imageIcon: "/img/icon/popup/checkmark-circle-outline.svg",
      onClick: () => {
        
      },
    },
    [ModalEntities.update_success]: {
      title: "¡Actualizamos tus datos!",
      body: "Tu información se ha actualizado correctamente.",
      buttonMessage: "Cerrar",
      imageIcon: "/img/icon/popup/checkmark-circle-outline.svg",
      onClick: modalClose
    },
    [ModalEntities.logout]: {
      title: "¿Está seguro de que desea cerrar sesión?",
      body: "",
      buttonMessage: "Cerrar",
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: () =>{
        
      }
    },
    [ModalEntities.change_ticket]: {
      title: "¿Estás seguro de cambiar tu boleto? ",
      body: "",
      buttonMessage: "Confirmar",
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: () =>{

      }
    },
    [ModalEntities.confirm_change]: {
      title: "Cambio de boleto éxitoso",
      body: "",
      buttonMessage: "Volver al inicio",
      imageIcon: "/img/icon/popup/checkmark-circle-outline.svg",
      onClick: () =>{

      }
    },
    [ModalEntities.annulation_purse]: {
      title: "¿Estás seguro de enviar el valor del pasaje al monedero virtual?",
      body: "",
      buttonMessage: "Enviar",
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: () =>{

      }
    },
    [ModalEntities.annulation_success]: {
      title: "¡Devolución existosa!",
      body: "Hemos enviado el comprobante de devolución del boleto. Recuerda que el tiempo dependerá de la opción seleccionada.",
      buttonMessage: "Volver al inicio",
      imageIcon: "/img/icon/popup/checkmark-circle-outline.svg",
      onClick: () =>{

      }
    },
    [ModalEntities.confirm_return]: {
      title: "¿Estás seguro de devolver los pasajes? ",
      body: "",
      buttonMessage: "Confirmar",
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: () =>{

      }
    },
    [ModalEntities.confirm_success]: {
      title: "¡Devolución existosa!",
      body: "El valor del pasaje se verá reflejado en la facturación de tu cuenta de crédito.",
      buttonMessage: "Volver al inicio",
      imageIcon: "/img/icon/popup/checkmark-circle-outline.svg",
      onClick: () =>{

      }
    },
    [ModalEntities.delete_car]: {
      title: "¡Usuario(a)!",
      body: "Si hay asientos actualmente seleccionados, al realizar una búsqueda para otra fecha, estos asientos serán liberados y se limpiara el carrito. ",
      buttonMessage: "Limpiar y buscar servicios",
      imageIcon: "/img/icon/popup/warning-outline.svg",
      onClick: modalMethods
    },
  };
  

  const handleButtonClick = () => {
    if (popInfo[modalKey]?.onClick) {
      popInfo[modalKey].onClick();
    }
  }

  return (
    <div className={styles["popup-overlay"]}>
      <div className={styles["popup-container"]}>
        <div className={styles["popup-header"]}>
          <div className={"row justify-content-center"}>
            <div className={"col-12"}>
              <div className={"row justify-content-center"}>
                <div className={"col-12 text-center"}>
                  <span className={styles["close-icon"]} onClick={modalClose}>
                    &times;
                  </span>
                </div>
              </div>
            </div>
            <div className={"col-12"}>
              <div className={"row justify-content-center"}>
                <div className={"col-12 text-center"}>
                  <img src={popInfo[modalKey]?.imageIcon || ""}></img>
                </div>
              </div>
            </div>
            <div className={"col-12"}>
              <div className={"row justify-content-center"}>
                <div className={"col-12 text-center"}>
                  <div className={styles["popup-title"]}>
                    {popInfo[modalKey]?.title || ""}
                  </div>
                </div>
              </div>
            </div>
            <div className={"col-12"}>
              <div className={"row justify-content-center"}>
                <div className={"col-12 text-center"}>
                  <div className={styles["popup-body-text"]}>
                    {popInfo[modalKey]?.body || ""}
                  </div>
                </div>
              </div>
            </div>
            <div className={"col-12"}>
              <div className={"row justify-content-center"}>
                <div className={"col-9 text-center"}>
                  <div className={styles["popup-button"]}
                  onClick={ () =>{
                    handleButtonClick()
                  }}>
                    {popInfo[modalKey]?.buttonMessage || ""}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
