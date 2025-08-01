import React from "react";
import Acordeon from "../../../components/Acordeon/Acordeon.jsx";
import ResumenPago from "./ResumenPago/ResumenPago.jsx";
import InformacionComprador from "./InformacionComprador/InformacionComprador.jsx";
import MedioPago from "./MedioPago/MedioPago.jsx";
import styles from "./PagoCuponera.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import LocalStorageEntities from "entities/LocalStorageEntities";
import { decryptData } from "utils/encrypt-data";

const PagoCuponera = (props) => {
  const [medioDePago, setMedioDePago] = useState("");
  const { parrillaSeleccionada, setParrillaSeleccionada } = props;
  const [mediosPago, setMediosPago] = useState([]);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const localUser = decryptData(LocalStorageEntities.user_auth);
    setUsuario(localUser);
  }, []);

  async function obtenerMediosPagos() {
    try {
      const res = await axios.post("/api/ticket_sale/obtener-medios-pago", {});
      if (res.request.status) {
        setMediosPago(res.data);
      }
    } catch (e) {}
  }

  useEffect(() => {
    obtenerMediosPagos()
  }, [])

  return (
    <>
      <div className="">
        <main className={styles["main-content"]}>
          <section className={styles["info-list"]}>
            <Acordeon title="Datos del comprador" open={ true }>
              <InformacionComprador usuario={ usuario }/>
            </Acordeon>
            <Acordeon title="Método de pago" open={ true }>
              <MedioPago
                mediosPago={mediosPago}
                setMediosPago={setMediosPago}
              />
            </Acordeon>
          </section>
          <section className={styles["travel-summary"]}>
            <ResumenPago
              parrillaSeleccionada={parrillaSeleccionada}
              setMedioDePago={setMedioDePago}
            />
          </section>
        </main>
      </div>
    </>
  );
};

export default PagoCuponera;
