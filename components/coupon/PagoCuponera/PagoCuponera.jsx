import React from "react";
import Acordeon from "../../../components/Acordeon/Acordeon.jsx";
import ResumenPago from "./ResumenPago/ResumenPago.jsx";
import InformacionComprador from "./InformacionComprador/InformacionComprador.jsx";
import MedioPago from "./MedioPago/MedioPago.jsx";
import styles from "./PagoCuponera.module.css";
import { useEffect, useState } from "react";

const PagoCuponera = (props) => {
  const [ medioDePago, setMedioDePago] = useState("");
  const { parrillaSeleccionada, setParrillaSeleccionada } = props;
  return (
    <>
      <div className="row">
        <div className="col-12 col-md-8">
          <Acordeon
            title="Datos del comprador"
            content={<InformacionComprador/>}
          />
          <Acordeon
            title="Método de pago"
            content={<MedioPago/>}
          />
        </div>
        <div className="col-12 col-md-4">
          <ResumenPago 
          parrillaSeleccionada={parrillaSeleccionada} 
          setMedioDePago={setMedioDePago}
          />
        </div>
      </div>
    </>
  );
};

export default PagoCuponera;
