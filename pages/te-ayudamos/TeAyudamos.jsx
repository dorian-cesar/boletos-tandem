import Layout from "../../components/Layout";
import Footer from "../../components/Footer";
import Head from "next/head";
import styles from "./TeAyudamos.module.css";
import React, { useState, useEffect } from "react";
import PreguntasFrecuente from "../../components/PreguntasFrecuente/PreguntasFrecuente";
import NecesitasAyuda from "../../components/NecesitasAyuda/NecesitasAyuda";

const TeAyudamos = (props) => {
  const [stage, setStage] = useState(0);

  function cambiarVista(id) {
    setStage(id);
  }

  return (
    <Layout>
      <Head>
        <title>PullmanBus | Te Ayudamos</title>
      </Head>
      {stage == 0 ? (
        <div className={styles["body"]}>
          <div className={styles["title"]}>Nuestro canales de atención</div>
          <div className="container">
            <div className="d-flex justify-content-center">
              <div className="col-12 col-md-5">
                <div
                  className={`${styles["question-body"]} "d-flex justify-content-center" `}
                >
                  <div className={styles["image"]}>
                    <img src="/img/icon/help/help-circle-outline.svg"></img>
                  </div>
                  <div className={styles["title-message"]}>
                    Preguntas frecuentes
                  </div>
                  <div className={styles["message"]}>
                    Aquí tienes un montón de respuestas a las preguntas que la
                    gente suele hacer. Échale un vistazo y hagamos que todo sea
                    más fácil para ti!
                  </div>
                  <div className={""}>
                    <div
                      className={styles["button"]}
                      onClick={() => {
                        cambiarVista(1);
                      }}
                    >
                      Encuentra respuestas aquí
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-5">
                <div
                  className={`${styles["question-body"]} "d-flex justify-content-center" `}
                >
                  <div className={styles["image"]}>
                    <img src="/img/icon/help/megaphone-outline.svg"></img>
                  </div>
                  <div className={styles["title-message"]}>Escríbenos</div>
                  <div className={styles["message"]}>
                    ¿No hallaste lo que necesitabas en nuestra sección de
                    preguntas frecuentes? Mándanos un mensaje y nos pondremos en
                    acción para responderte lo más pronto posible.
                  </div>
                  <div className={""}>
                    <div
                      className={styles["button"]}
                      onClick={() => {
                        cambiarVista(2);
                      }}
                    >
                      Habla con Nosotros
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-center">
              <div className="col-12 col-md-5">
                <div className={`${styles["other-body"]}  `}>
                  <div className={styles["title-contact"]}>
                    Tambien puedes contactarnos a:
                  </div>
                  <div className={"row"}>
                    <div className={"col-12"}>
                      <img
                        className={styles["image-icon"]}
                        src="/img/icon/help/call-outline.svg"
                      ></img>
                      600 600 0018
                    </div>
                  </div>
                  <div className={"row"}>
                    <div className={"col-12"}>
                      <img
                        className={styles["image-icon"]}
                        src="/img/icon/help/what-up.svg"
                      ></img>
                      +56233048912
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-5">
                <div className={`${styles["other-body"]}  `}>
                  <div className={styles["title-contact"]}>
                    Horario de atención:
                  </div>
                  <div className={"row"}>
                    <div className={"col-12"}>
                      <span className={styles["text-bold"]}>SAC</span> | Lunes a
                      viernes: 09:00AM - 18:00PM
                    </div>
                  </div>
                  <div className={"row"}>
                    <div className={"col-12"}>
                      <span className={styles["text-bold"]}>Call Center</span> |
                      Lunes a viernes: 09:00AM - 18:00PM <br />
                      Sábado, domingos y festivos: 09:00AM - 19:00PM
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}

      {stage == 1 ? (
        <>
          <PreguntasFrecuente />
        </>
      ) : (
        <></>
      )}

      {stage == 2 ? (
        <>
          <NecesitasAyuda />
        </>
      ) : (
        <></>
      )}

      <Footer />
    </Layout>
  );
};

export default TeAyudamos;
