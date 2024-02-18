import React from "react";
import styles from "./ResumenViaje.module.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export const ResumenViaje = () => {
  
  const [resumen, setResumen] = useState({
    carro: {},
  });

  const carroCompras = useSelector((state) => state.compra?.listaCarrito) || [];
  const dispatch = useDispatch();
  
  const obtenerInformacion = () => {
    {
      Object.entries(carroCompras).map(([key, value]) => {
        const idaKey = value.ida[0].id;
        const vueltaKey = value.vuelta?.[0]?.id ?? null;
        const idaNombre = Object.keys(value)[0];
        const keys = Object.keys(value);
        const vueltaNombre = keys.length >= 2 ? keys[1] : null;
        const idaList = value.ida || [];
        const vueltaList = value.vuelta || [];

        let carro_temp = { ...resumen };
        const datos = [];

        let carritoIda = {
          titulo: idaNombre,
          detalle: [],
        };
        let carritoVuelta = {
          titulo: vueltaNombre,
          detalle: [],
        };

        Object.entries(idaList).map(([key, value]) => {
          let cantidadAsientos = 0;
          const datos = {
            origen: value.terminalOrigen,
            destino: value.terminalDestino,
            hora: value.horaSalida,
            cantidadAsientos: 0,
          };
          value.asientos.forEach((element) => {
            cantidadAsientos = cantidadAsientos + 1;
          });
          datos.cantidadAsientos = cantidadAsientos;
          carritoIda.detalle.push(datos);
        });

        Object.entries(vueltaList).map(([key, value]) => {
            let cantidadAsientos = 0;
            const datos = {
              origen: value.terminalOrigen,
              destino: value.terminalDestino,
              hora: value.horaSalida,
              cantidadAsientos: 0,
            };
            value.asientos.forEach((element) => {
              cantidadAsientos = cantidadAsientos + 1;
            });
            datos.cantidadAsientos = cantidadAsientos;
            carritoVuelta.detalle.push(datos);
          });
        datos.push(carritoIda);
        datos.push(carritoVuelta);
        carro_temp.carro["lista"] = datos;
        setResumen(carro_temp);
      });
    }
  };

  useEffect(() => {
    obtenerInformacion();
  }, []);

  return (
    <div className={styles["resumen-container"]}>
      <h3>Resumen del viaje</h3>
      <div className={styles["contenedor-servicios"]}>
        <div className={styles["servicio-ida"]}>
          {Array.isArray(resumen.carro.lista) &&
            resumen.carro.lista.map((element) => (
              <div className={styles["servicio-ida"]} key={element.titulo}>
                {element.titulo}
                <div className={styles["detalle-container"]}>
                  {Array.isArray(element.detalle) &&
                    element.detalle.map((detalleItem, index) => (
                      <div key={index} className={styles["detalle-item"]}>
                        {detalleItem.origen} - {detalleItem.destino} -{" "}
                        {detalleItem.hora}
                        <p>
                          Cantidad de Asientos: {detalleItem.cantidadAsientos}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
        <div className={styles["servicio-vuelta"]}></div>
      </div>
    </div>
  );
};
