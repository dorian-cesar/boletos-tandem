import axios from "axios";
import DatePicker, { registerLocale } from "react-datepicker";
import { useEffect, useState, forwardRef, useRef, useMemo } from "react";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useForm } from "/hooks/useForm";
import Head from "next/head";
import styles from "./RegistroPasajero.module.css";
import Popup from "../../Popup/Popup";

const RegistroPasajero = (props) => {
  const { user, setVista } = props;
  const router = useRouter();
  const { getItem } = useLocalStorage();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(false);
  const [alerta, setAlerta] = useState({
    msg: "",
    visible: false,
    type: "",
  });
  const [pasajeros, setPasajeros] = useState([]);
  const [mostrarPopup, setMostrarPopup] = useState(false);

  const abrirPopup = () => {
    setMostrarPopup(true);
  };

  const cerrarPopup = () => {
    setMostrarPopup(false);
  };

  useEffect(() => {
    setIsLoading(false);
    async function obtenerPasajeros() {
      try {
        let id = {
          rut: user.rut.replace(/\./g, ""),
          tipoDocumento: user.tipoDocumento,
        };
        const data = await axios.post("/api/user/obtener-pasajeros", {
          id,
        });
        if (data.data.status) {
          setPasajeros(data.data.object);
        }
      } catch ({ message }) {
        console.error(`Error al obtener menú [${message}]`);
      }
    }
    obtenerPasajeros();
  }, []);

  const registrarPasajero = () => {
    setVista("registrarPasajero");
  }

  return (
    <>
      <div className={styles["menu-central"]}>
        <div className={`${styles["bloque"]} "col-12 col-md-12"`}>
          <div className={"row "}>
            <div className={"col-6"}>
              <a className={styles["title-passenger"]}>
                Registro de pasajeros(s)
              </a>
            </div>
            {mostrarPopup && (
              <Popup
                titulo="Título del Popup"
                mensaje="Este es un mensaje de ejemplo en el popup."
                onClose={cerrarPopup}
              />
            )}
            <div className={"col-6"}>
              <div
                className={styles["passenger-button-add"]}
                onClick={registrarPasajero}
              >
                <img src="../img/icon/profile/add-circle-outline.svg" alt="" />
                <a className={styles["text"]}>Registrar pasajero</a>
              </div>
            </div>
          </div>
        </div>
        <div className={styles["bloque-margin"]}>
          <div className={"row"}>
            <div className={"col-12 "}>
              {pasajeros.map((pasajero, index) => (
                <div className="col-12">
                  <div
                    key={index}
                    className={"container-pasajero row align-items-center"}
                  >
                    <div className={"col-2"}>
                      <img src="../img/icon/profile/bus1.svg" alt="" />
                    </div>
                    <div className={"col-4"}>
                      <a
                        className={styles["nombre"]}
                      >{`${pasajero.nombres} ${pasajero.apellidos}`}</a>
                    </div>
                    <div className={"col-3"}>
                      <a className={styles["eliminar"]}>Eliminar</a>
                    </div>
                    <div className={"col-3"}>
                      <a className={styles["modificar"]}>Modificar</a>
                      <img
                        src="../img/icon/profile/create-outline.svg"
                        alt=""
                      />
                    </div>
                  </div>
                  <br></br>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegistroPasajero;
