import { useSelector, useDispatch } from "react-redux";
import styles from "./ResumenServicio.module.css";
import Rut from "rutjs";
import { useEffect, useState } from "react";
import Acordeon from "../../../Acordeon/Acordeon";
import InformacionPasajero from "./InformacionPasajero/InformacionPasajero";

const ResumenServicio = (props) => {
  const dispatch = useDispatch();
  const carroVenta = useSelector((state) => state.compra.listaCarrito);
  const [infoGrouped, setInfoGrouped] = useState([]);

  function groupInfo() {
    const groupInfo = [];

    Object.entries(carroVenta).map(([key, value]) => {

      debugger;
      const viaje = `${ value.ida[0].terminalOrigen }-${ value.ida[0].terminalDestino }`;
      const fecha = value.ida[0].fechaServicio;
      const hora = value.ida[0].horaSalida;
      const asientos = [];

      value.ida.forEach(servicio => servicio.asientos.forEach(asiento => asientos.push(asiento)));

      const servicioFormateado = { ...value.ida[0] };
      delete servicioFormateado.asientos;
      delete servicioFormateado.asientos1;
      delete servicioFormateado.asientos2;

      groupInfo.push({
        ...servicioFormateado,
        viaje,
        fecha,
        hora,
        asientos
      });

      if( value.vuelta ) {
        const viaje = `${ value.vuelta[0].terminalOrigen } - ${ value.vuelta[0].terminalDestino }`;
        const fecha = value.vuelta[0].fechaServicio;
        const hora = value.vuelta[0].horaSalida;
        const asientos = [];

        value.vuelta.forEach(servicio => servicio.asientos.forEach(asiento => asientos.push(asiento)));

        const servicioFormateado = value.vuelta[0];
        delete servicioFormateado.asientos;
        delete servicioFormateado.asientos1;
        delete servicioFormateado.asientos2;

        groupInfo.push({
          ...servicioFormateado,
          viaje,
          fecha,
          hora,
          asientos
        });
      }
    });

    setInfoGrouped(groupInfo);
  }

  useEffect(() => groupInfo(), []);

  return (
    <>
      {
        infoGrouped.map((info, index) => {
          return (
            <Acordeon
              key={ index }
              viaje={ info.viaje }
              fecha={ info.fecha }
              hora={ info.hora }
            >
              <InformacionPasajero data={[info]} />
            </Acordeon>
          );
        })
      }
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
