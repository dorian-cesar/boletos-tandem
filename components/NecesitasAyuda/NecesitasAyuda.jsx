import styles from "./NecesitasAyuda.module.css";
import React, { useState, useEffect } from "react";
import Popup from "../Popup/Popup";
import ModalEntities from "../../entities/ModalEntities";
import axios from "axios";
import { isValidDatosConsulta } from "../../utils/user-pasajero";
import { toast } from "react-toastify";

const NecesitasAyuda = (props) => {
    const { setStage } = props;
    const [consulta, setConsulta] = useState({
        nombreSolicitante: null,
        contacto: null,
        mail: null,
        cuerpoSolicitud: null,
    });

    const [mostrarPopup, setMostrarPopup] = useState(false);
    const [tipoMostrar, setTipoMostrar] = useState(null);

    function setDataConsulta({ name, value }) {
        try {
            let carro_temp = { ...consulta };
            carro_temp[name] = value;
            setConsulta(carro_temp);
        } catch ({ message }) {
            console.error(
                `Error al agregar informacion de la consulta [${message}]`
            );
        }
    }

    const abrirPopup = () => {
        setMostrarPopup(true);
    };
    const cerrarPopup = () => {
        setMostrarPopup(false);
    };

    const guardarSolicitud = async () => {
        let validator = isValidDatosConsulta(consulta);
        if (validator.valid) {
            toast.error(validator.error, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
            });
            return;
        }
        try {
            const res = await axios.post(
                "/api/parametros/guardar-solicitud-ayuda",
                consulta
            );
            if (res.data.status) {
                setTipoMostrar("OK");
                abrirPopup();
            }
        } catch (e) {
            setTipoMostrar("ERROR");
            abrirPopup();
        }
    };

    function volverInicio() {
        setStage(0);
    }

    return (
        <>
            <div className={styles["body"]}>
                <div className="container">
                    <div className="row d-flex justify-content-center">
                        <div className={styles["container"]}>
                            <span className={styles["title"]}>
                                ¿Necesitas ayuda?
                            </span>
                            <span className={styles["sub-title"]}>
                                ¿Alguna pregunta, consulta o reclamo en mente?
                                ¡No dudes en enviarnos un mensaje! Estamos
                                listos para actuar y responder lo más rápido
                                posible.
                            </span>
                            <div className={styles["body-form"]}>
                                <div className={"row"}>
                                    <div className={"col"}>
                                        <label className={styles["title-data"]}>
                                            Nombre(s)
                                        </label>
                                        <input
                                            type="text"
                                            className={styles["input-data"]}
                                            name="nombreSolicitante"
                                            value={consulta?.nombreSolicitante}
                                            placeholder="Ej: Emma Cortez"
                                            onChange={(e) =>
                                                setDataConsulta(e.target)
                                            }
                                        />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={"col-6"}>
                                        <label className={styles["title-data"]}>
                                            N° de contacto
                                        </label>
                                        <input
                                            type="text"
                                            className={styles["input-data"]}
                                            name="contacto"
                                            value={consulta?.contacto}
                                            placeholder="Ej: +56 9 1111 1111"
                                            onChange={(e) =>
                                                setDataConsulta(e.target)
                                            }
                                        />
                                    </div>
                                    <div className={"col-6"}>
                                        <label className={styles["title-data"]}>
                                            Correo electrónico
                                        </label>
                                        <input
                                            type="text"
                                            className={styles["input-data"]}
                                            name="mail"
                                            value={consulta?.mail}
                                            placeholder="Ej: ecortez@gmail.com"
                                            onChange={(e) =>
                                                setDataConsulta(e.target)
                                            }
                                        />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={"col-12"}>
                                        <label className={styles["title-data"]}>
                                            Cuerpo mensaje
                                        </label>
                                        <textarea
                                            type="text"
                                            className={
                                                styles["input-data-message"]
                                            }
                                            name="cuerpoSolicitud"
                                            value={consulta?.cuerpoSolicitud}
                                            placeholder="Opcional"
                                            onChange={(e) =>
                                                setDataConsulta(e.target)
                                            }
                                        />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={"col-12"}>
                                        <div
                                            className={
                                                consulta.nombreSolicitante &&
                                                consulta.contacto &&
                                                consulta.mail
                                                    ? styles["button"]
                                                    : styles["button-disabled"]
                                            }
                                            onClick={(e) => {
                                                consulta.nombreSolicitante &&
                                                consulta.contacto &&
                                                consulta.mail
                                                    ? guardarSolicitud()
                                                    : "";
                                            }}
                                        >
                                            Enviar
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {mostrarPopup &&
                    (tipoMostrar === "ERROR" ? (
                        <Popup
                            modalKey={ModalEntities.request_bad_help}
                            modalClose={cerrarPopup}
                            modalMethods={volverInicio}
                        />
                    ) : (
                        <Popup
                            modalKey={ModalEntities.request_for_help}
                            modalClose={cerrarPopup}
                            modalMethods={volverInicio}
                        />
                    ))}
            </div>
        </>
    );
};

export default NecesitasAyuda;
