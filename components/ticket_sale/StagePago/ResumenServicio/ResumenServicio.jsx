import { useSelector, useDispatch } from "react-redux";
import styles from "./ResumenServicio.module.css";
import Rut from "rutjs";
import { useEffect, useState } from "react";
import Acordeon from "../../../Acordeon/Acordeon";
import InformacionPasajero from "./InformacionPasajero/InformacionPasajero";

const ResumenServicio = (props) => {
  const dispatch = useDispatch();
  const carroVenta = useSelector((state) => state.compra.listaCarrito);
  return (
    <>
      {Object.entries(carroVenta).map(([key, value]) => {
        const idaKey = value.ida[0].id;
        const vueltaKey = value.vuelta?.[0]?.id ?? null;
        const idaNombre = Object.keys(value)[0];
        const keys = Object.keys(value);
        const vueltaNombre = keys.length >= 2 ? keys[1] : null;
        const idaLista = value.ida || [];
        const vueltaLisa = value.vuelta || [];
        return (
          <>
            <Acordeon
              key={idaKey}
              title={idaNombre}
              children={<InformacionPasajero data={idaLista} />}
            />
            {vueltaKey && (
              <Acordeon
                key={vueltaKey}
                title={vueltaNombre}
                children={<InformacionPasajero data={vueltaLisa} />}
              />
            )}
          </>
        );
      })}
    </>
  );
};

export default ResumenServicio;
