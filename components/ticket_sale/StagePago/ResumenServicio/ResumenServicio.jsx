import styles from "./ResumenServicio.module.css";
import Rut from "rutjs";
import { useEffect, useState } from "react";
import Acordeon from "../../../Acordeon/Acordeon";
import InformacionPasajero from "./InformacionPasajero/InformacionPasajero";

import { useSelector, useDispatch } from "react-redux";
import { agruparInformacionPago } from "store/usuario/compra-slice";

const ResumenServicio = (props) => {
  const dispatch = useDispatch();
  const carroVenta = useSelector((state) => state.compra.listaCarrito);
  const informacionAgrupada = useSelector(
    (state) => state.compra.informacionAgrupada
  );
  const { origen, destino } = useSelector((state) => state.compra);

  function groupInfo() {
    const groupInfo = [];

    Object.entries(carroVenta).map(([key, value]) => {
      if (value.ida) {
        value.ida.forEach((servicioIda) => {
          const findService = groupInfo.find(
            (servicio) =>
              servicio.viaje === `${servicio.origin}-${servicio.destination}` &&
              servicio.fecha === servicioIda.date &&
              servicio.hora === servicioIda.departureTime
          );
          if (findService) {
            groupInfo.map((servicio) => {
              if (
                servicio.viaje ===
                  `${servicio.origin}-${servicio.destination}` &&
                servicio.fecha === servicioIda.date &&
                servicio.hora === servicioIda.departureTime
              ) {
                servicio.asientos.push(...servicioIda.asientos);
              }
            });
          } else {
            const viaje = `${servicioIda.origin}-${servicioIda.destination}`;
            const fecha = servicioIda.date;
            const hora = servicioIda.departureTime;
            const asientos = [];

            servicioIda.asientos.forEach((asiento) => asientos.push(asiento));

            const servicioFormateado = { ...servicioIda };
            delete servicioFormateado.asientos;
            delete servicioFormateado.asientos1;
            delete servicioFormateado.asientos2;

            groupInfo.push({
              ...servicioFormateado,
              viaje,
              fecha,
              hora,
              asientos,
            });
          }
        });
      }

      if (value.vuelta) {
        value.vuelta.forEach((servicioVuelta) => {
          const findService = groupInfo.find(
            (servicio) =>
              servicio.viaje === `${servicio.destination}-${servicio.origin}` &&
              servicio.fecha === servicioVuelta.date &&
              servicio.hora === servicioVuelta.departureTime
          );
          if (findService) {
            groupInfo.map((servicio) => {
              if (
                servicio.viaje === `${servicio.destination}-${servicio.origin}` &&
                servicio.fecha === servicioVuelta.date &&
                servicio.hora === servicioVuelta.departureTime
              ) {
                servicio.asientos.push(...servicioVuelta.asientos);
              }
            });
          } else {
            const viaje = `${servicioVuelta.destination}-${servicioVuelta.origin}`;
            const fecha = servicioVuelta.date;
            const hora = servicioVuelta.departureTime;
            const asientos = [];
            servicioVuelta.asientos.forEach((asiento) =>
              asientos.push(asiento)
            );
            const servicioFormateado = { ...servicioVuelta };
            delete servicioFormateado.asientos;
            delete servicioFormateado.asientos1;
            delete servicioFormateado.asientos2;
            groupInfo.push({
              ...servicioFormateado,
              viaje,
              fecha,
              hora,
              asientos,
            });
          }
        });
      }
    });

    dispatch(agruparInformacionPago(groupInfo));
  }

  function renderInformacionPasajero(info) {
    let pasajero = 0;
    const renderInfo = info.asientos.map((asiento, index) => {
      if (asiento.tipo !== "pet") {
        pasajero++;
        return (
          <InformacionPasajero
            className="w-100"
            key={`${asiento.asiento}-key-${index}`}
            title={
              asiento.asientoAsociado
                ? `Pasajero ${pasajero} | Asiento ${asiento.asiento} + Asiento ${asiento.asientoAsociado} 🐾`
                : `Pasajero ${pasajero} | Asiento ${asiento.asiento}`
            }
            asiento={asiento}
            servicio={info}
            nacionalidades={props.nacionalidades}
          />
        );
      }
    });
    return renderInfo;
  }

  useEffect(() => groupInfo(), []);

  return (
    <>
      {informacionAgrupada.map((info, index) => {
        return renderInformacionPasajero(info);
      })}
    </>
  );
};

export default ResumenServicio;
