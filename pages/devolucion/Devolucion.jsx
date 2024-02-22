import Layout from "../../components/Layout";
import Loader from "../../components/Loader";
import Footer from "../../components/Footer";
import Head from "next/head";
import styles from "./Devolucion.module.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import BusquedaBoletos from "../../components/Devolucion/BusquedaBoletos/BusquedaBoletos";

const Devolucion = (props) => {
  const [stage, setStage] = useState(0);
  const [loadingBoleto, setLoadingBoleto] = useState(true);
  const [boletos, setBoletos] = useState([]);

  return (
    <Layout>
      <Head>
        <title>PullmanBus | Devolución</title>
      </Head>
      <div className={styles["home"]}>
        {stage == 0 ? (
          <>
            <div className={styles["container"]}>
              <div className={"fila"}>
                <div className={styles["title"]}>Devolución de boleto</div>
                <div className={styles["sub-title"]}>
                  Puedes realizar cambios en tus boletos tanto en nuestro sitio
                  web como en las boleterías autorizadas, siempre y cuando lo
                  hagas hasta cuatro (4) horas antes de la hora de salida del
                  bus.
                </div>
                <BusquedaBoletos
                  setStage={setStage}
                  setBoletos={setBoletos}
                  setLoadingBoleto={setLoadingBoleto}
                />
              </div>
            </div>
          </>
        ) : (
          <></>
        )}

        {stage == 1 ? (
          <>
            aqui van los pinches boletos
          </>
        ) : (
          <></>
        )}
      </div>

      <Footer />
    </Layout>
  );
};

export default Devolucion;
