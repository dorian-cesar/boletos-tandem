import Layout from "../../components/Layout";
import Loader from "../../components/Loader";
import Footer from "../../components/Footer";
import Head from "next/head";
import styles from "./Devolucion.module.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import BusquedaBoletos from "../../components/Devolucion/BusquedaBoletos/BusquedaBoletos";
import BoletosSeleccion from "../../components/Devolucion/BoletosSeleccion/BoletosSeleccion";
import ModoDevolucion from "../../components/Devolucion/ModoDevolucion/ModoDevolucion";

const Devolucion = (props) => {
  const [stage, setStage] = useState(0);
  const [loadingBoleto, setLoadingBoleto] = useState(true);
  const [boletos, setBoletos] = useState([]);
  const [selectedBoletos, setSelectedBoletos] = useState([]);
  const [medioDevolucion, setMedioDevolucion] = useState(null);

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
          <BoletosSeleccion
            setStage={setStage}
            boletos={boletos}
            setLoadingBoleto={setLoadingBoleto}
            selectedBoletos={selectedBoletos}
            setSelectedBoletos={setSelectedBoletos}
          />
        ) : (
          <></>
        )}

        {stage == 2 ? (
          <ModoDevolucion
            setStage={setStage}
            medioDevolucion={medioDevolucion}
            setMedioDevolucion={setMedioDevolucion}
          />
        ) : (
          <></>
        )}
      </div>

      <Footer />
    </Layout>
  );
};

export default Devolucion;
