import React from "react";
import Acordeon from "../../../components/Acordeon/Acordeon.jsx";
import ResumenPago from "./ResumenPago/ResumenPago.jsx";
import InformacionComprador from "./InformacionComprador/InformacionComprador.jsx";
import MedioPago from "./MedioPago/MedioPago.jsx";
import styles from "./PagoCuponera.module.css";
import { useEffect, useState } from "react";

const PagoCuponera = (props) => {
  const [medioDePago, setMedioDePago] = useState("");
  const { parrillaSeleccionada, setParrillaSeleccionada } = props;
  const [mediosPago, setMediosPago] = useState([]);

  async function obtenerMediosPagos() {
    try {
      const res = await axios.post("/api/ticket_sale/obtener-medios-pago", {});
      if (res.request.status) {
        setMediosPago(res.data);
      }
    } catch (e) {}
  }

  return (
    <>
      <div className="row">
        <main className={styles["main-content"]}>
          <section className={styles["info-list"]}>
            <Acordeon title="Datos del comprador">
              <InformacionComprador />
            </Acordeon>

            <Acordeon title="Método de pago">
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
