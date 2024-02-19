import styles from "./ResumenServicio.module.css";
import Rut from "rutjs";
import { useEffect, useState } from "react";
import Acordeon from "../../../Acordeon/Acordeon";
import InformacionPasajero from "./InformacionPasajero/InformacionPasajero";

import { useSelector, useDispatch } from 'react-redux'
import { agruparInformacionPago } from "store/usuario/compra-slice";

const ResumenServicio = (props) => {
  const dispatch = useDispatch();
  const carroVenta = useSelector((state) => state.compra.listaCarrito);
  const informacionAgrupada = useSelector((state) => state.compra.informacionAgrupada);

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

        const servicioFormateado = { ...value.vuelta[0] };
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

    dispatch(agruparInformacionPago(groupInfo));
  }

  useEffect(() => groupInfo(), []);

  return (
    <>
      {
        informacionAgrupada.map((info, index) => {
          return (
            <Acordeon
              key={ index }
              viaje={ info.viaje }
              fecha={ info.fecha }
              hora={ info.hora }
            >
              { index > 0 && 
              <div className="form-check">
                <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                <label className="form-check-label" htmlFor="flexCheckDefault">
                  Usar los datos del primer viaje
                </label>
              </div> 
              }
              {
                info.asientos.map((asiento, index) => {
                  return (
                    <InformacionPasajero 
                      className='w-100' 
                      title={ `Pasajero ${ index + 1 } | Asiento ${ asiento.asiento }` }
                      asiento={ asiento }
                      servicio={ info } />
                  );
                })
              }
            </Acordeon>
          );
        })
      }
    </>
  );
};

export default ResumenServicio;
