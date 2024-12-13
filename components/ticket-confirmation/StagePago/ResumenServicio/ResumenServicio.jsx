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

      value.ida.forEach(servicioIda => {
        const findService = groupInfo.find(servicio => servicio.viaje === `${ servicioIda.terminalOrigen }-${ servicioIda.terminalDestino }` && servicio.fecha === servicioIda.fechaServicio && servicio.hora === servicioIda.horaSalida);
        if( findService ) {
          groupInfo.map(servicio => {
            if( servicio.viaje === `${ servicioIda.terminalOrigen }-${ servicioIda.terminalDestino }` && servicio.fecha === servicioIda.fechaServicio && servicio.hora === servicioIda.horaSalida ) {
              servicio.asientos.push(...servicioIda.asientos);
            }
          });
        } else {
          const viaje = `${ servicioIda.terminalOrigen }-${ servicioIda.terminalDestino }`;
          const fecha = servicioIda.fechaSalida;
          const hora = servicioIda.horaSalida;
          const asientos = [];

          servicioIda.asientos.forEach(asiento => asientos.push(asiento));

          const servicioFormateado = { ...servicioIda };
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

      if( value.vuelta ) {
        value.vuelta.forEach(servicioVuelta => {
          const findService = groupInfo.find(servicio => servicio.viaje === `${ servicioVuelta.terminalOrigen }-${ servicioVuelta.terminalDestino }` && servicio.fecha === servicioVuelta.fechaServicio && servicio.hora === servicioVuelta.horaSalida);
          if( findService ) {
            groupInfo.map(servicio => {
              if( servicio.viaje === `${ servicioVuelta.terminalOrigen }-${ servicioVuelta.terminalDestino }` && servicio.fecha === servicioVuelta.fechaServicio && servicio.hora === servicioVuelta.horaSalida ) {
                servicio.asientos.push(...servicioVuelta.asientos);
              }
            });
          } else {
            const viaje = `${ servicioVuelta.terminalOrigen }-${ servicioVuelta.terminalDestino }`;
            const fecha = servicioVuelta.fechaSalida;
            const hora = servicioVuelta.horaSalida;
            const asientos = [];
  
            servicioVuelta.asientos.forEach(asiento => asientos.push(asiento));
  
            const servicioFormateado = { ...servicioVuelta };
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
              open={ true }
            >
              {
                info.asientos.map((asiento, index) => {
                  return (
                    <InformacionPasajero 
                      className='w-100' 
                      key={ `${ asiento.asiento }-key-${ index }` }
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
