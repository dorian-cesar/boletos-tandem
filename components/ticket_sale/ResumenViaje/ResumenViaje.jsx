import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import styles from "./ResumenViaje.module.css";
import { useDispatch, useSelector } from "react-redux";
import { format } from "@formkit/tempo"
import { newIsValidPasajero } from "../../../utils/user-pasajero";
import { toast } from "react-toastify";

export const ResumenViaje = () => {
  
  const [resumen, setResumen] = useState({
    carro: {},
  });

  const clpFormat = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  });

  const [saldoMonederoVirtual, setSaldoMonederoVirtual] = useState(clpFormat.format(0));
  const [totalPagar, setTotalPagar] = useState(0);

  const carroCompras = useSelector((state) => state.compra?.listaCarrito) || [];
  const informacionAgrupada = useSelector((state) => state.compra?.informacionAgrupada) || [];
  const dispatch = useDispatch();

  const obtenerInformacion = () => {
    {
      Object.entries(carroCompras).map(([key, value]) => {
        const fechaIdaFormateada = value.ida[0].fechaSalida.split('/');
        const fechaIda = new Date(`${ fechaIdaFormateada[1] }/${ fechaIdaFormateada[0] }/${ fechaIdaFormateada[2]}`);


        const idaNombre = `Salida, ${ format(fechaIda, "ddd D MMM") }`;
        const keys = Object.keys(value);

        let vueltaNombre = '';
        if( keys.length >= 2 ) {
          const fechaVueltaFormateada = value.vuelta[0].fechaSalida.split('/');
          const fechaVuelta = new Date(`${ fechaVueltaFormateada[1] }/${ fechaVueltaFormateada[0] }/${ fechaVueltaFormateada[2]}`);
          vueltaNombre = `Vuelta, ${ format(fechaVuelta, "ddd D MMM") }`;
        }

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
          const datos = {
            origen: value.terminalOrigen,
            destino: value.terminalDestino,
            hora: value.horaSalida,
            horaLlegada: value.horaLlegada,
            cantidadAsientos: 0,
            total: 0
          };

          value.asientos.forEach((element) => {
            datos.cantidadAsientos += 1;
            datos.total += element.valorAsiento;
          });

          datos.total = clpFormat.format(datos.total);

          carritoIda.detalle.push(datos);
        });

        Object.entries(vueltaList).map(([key, value]) => {
            const datos = {
              origen: value.terminalOrigen,
              destino: value.terminalDestino,
              hora: value.horaSalida,
              horaLlegada: value.horaLlegada,
              cantidadAsientos: 0,
              total: 0
            };

            value.asientos.forEach((element) => {
              datos.cantidadAsientos += 1;
              datos.total += element.valorAsiento;
            });

            datos.total = clpFormat.format(datos.total);

            carritoVuelta.detalle.push(datos);
          });
        datos.push(carritoIda);
        datos.push(carritoVuelta);
        carro_temp.carro["lista"] = datos;
        setResumen(carro_temp);
      });
    }
  };

  async function sendToPayment() {
    try {
      debugger;
      const validator = isPaymentValid();

      if( !validator.valid ) {
        toast.error(validator.error, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return;
      }

      return;
      
      let pasajes = [
        ...carro.clientes_ida.map((clientesIdaMapped, clientesIdaIndex) => {
          const pasajero = clientesIdaMapped.pet
            ? carro.clientes_ida[clientesIdaIndex - 1]
            : clientesIdaMapped.pasajero;
          const convenioActivo = convenioActive
            ? convenioActive.idConvenio
            : "";
          const datoConvenio = convenioActive
            ? convenioActive.listaAtributo[0].valor
            : "";
          const precioConvenio = convenioActive
            ? Number(
                convenioActive.listaBoleto.find(
                  (boleto) =>
                    boleto.origen == clientesIdaMapped.origen &&
                    boleto.asiento == clientesIdaMapped.asiento &&
                    boleto.piso == clientesIdaMapped.piso
                ).pago
              )
            : clientesIdaMapped.tarifa.replace(",", "");
          return new PasajePagoDTO(
            clientesIdaMapped,
            pasajero,
            clientesIdaMapped.extras,
            convenioActivo,
            precioConvenio,
            datoConvenio
          );
        }),
        ...carro.clientes_vuelta.map(
          (clientesVueltaMapped, clientesVueltaIndex) => {
            const pasajero = clientesVueltaMapped.pet
              ? carro.clientes_ida[clientesVueltaIndex - 1]
              : clientesVueltaMapped.pasajero;
            const convenioActivo = convenioActive
              ? convenioActive.idConvenio
              : "";
            const datoConvenio = convenioActive
              ? convenioActive.listaAtributo[0].valor
              : "";
            const precioConvenio = convenioActive
              ? Number(
                  convenioActive.listaBoleto.find(
                    (boleto) =>
                      boleto.origen == clientesVueltaMapped.origen &&
                      boleto.asiento == clientesVueltaMapped.asiento &&
                      boleto.piso == clientesVueltaMapped.piso
                  ).pago
                )
              : clientesVueltaMapped.tarifa.replace(",", "");
            return new PasajePagoDTO(
              clientesVueltaMapped,
              pasajero,
              clientesVueltaMapped.extras,
              convenioActivo,
              precioConvenio,
              datoConvenio
            );
          }
        ),
      ];

      const { email, rut } = carro.datos;

      const { data } = await axios.post(
        "/api/ticket_sale/guardar-carro",
        new GuardarCarroDTO(email, rut, getTotal(), pasajes)
      );

      if (Boolean(data.error)) {
        toast.error(data.error.message || "Error al completar la transacción", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return;
      }

      setPayment({
        ...payment,
        url: data.url,
        token: data.token,
      });
    } catch (error) {
      console.error(`Error al completar la transacción [${error.message}]`);
      // toast.error(
      //   response.data.message || "Error al completar la transacción",
      //   {
      //     position: "bottom-center",
      //     autoClose: 5000,
      //     hideProgressBar: false,
      //   }
      // );
    }
  }

  function isPaymentValid() {
    try {
      let validator;
      informacionAgrupada.forEach((servicio) => {
        servicio.asientos.forEach((asiento) => {
          if (!validator || validator.valid ) {
            validator = newIsValidPasajero(asiento);
          }
        });
      })
      return validator;
    } catch ({ message }) {
      console.error(`Error al validar el pago [${message}]`);
    }
  }

  useEffect(() => {
    obtenerInformacion();
  }, []);

  useEffect(() => {
    let total = 0;
    Object.entries(carroCompras).map(([key, value]) => {
      const idaList = value.ida || [];
      const vueltaList = value.vuelta || [];

      Object.entries(idaList).map(([key, value]) => {
        value.asientos.forEach((element) => {
          total += element.valorAsiento;
        });
      });

      Object.entries(vueltaList).map(([key, value]) => {
        value.asientos.forEach((element) => {
          total += element.valorAsiento;
        });
      });
    });

    setTotalPagar(total);
  }, [resumen])

  return (
    <div className={styles["resumen-container"]}>
      <h3>Resumen del viaje</h3>
      <div className={styles["contenedor-servicios"]}>
        <div className={styles["servicio-ida"]}>
          {Array.isArray(resumen.carro.lista) &&
            resumen.carro.lista.map((element) => (
              <div className={styles["servicio-ida"]} key={element.titulo}>
                <b className={ styles['titulo-servicio'] }>{ element.titulo }</b>
                <div className={styles["detalle-container"]}>
                  {Array.isArray(element.detalle) &&
                    element.detalle.map((detalleItem, index) => (
                      <div key={index} className={styles["detalle-item"]}>
                        <ul>
                          <li>
                            <div>{ detalleItem.origen }</div>
                            <div>{ detalleItem.hora }</div>
                          </li>
                          <li>
                            <div>{ detalleItem.destino }</div>
                            <div>{ detalleItem.horaLlegada }</div>
                          </li>
                        </ul>
                        <div className={ styles['resumen-servicio'] }>
                          <span>Cantidad de Asientos: {detalleItem.cantidadAsientos}</span>
                          <b>{ detalleItem.total }</b>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
        <div className={ styles['total-container'] }>
          <div className={ `form-check form-switch ${ styles['utiliza-monedero-virtual'] }` }>
            <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" />
            <label className="form-check-label" htmlFor="flexSwitchCheckDefault">
              Utilizar monedero virtual ({ saldoMonederoVirtual })
            </label>
            <img src="/img/icon/general/information-circle-outline.svg"/>
            <span className={ styles['tooltip-text'] }>Sólo se puede pagar con el monedero cuando inicies sesión.</span>
          </div>
          <div className={ styles['contanedor-total-pagar'] }>
            <span>Total a pagar: { clpFormat.format(totalPagar) }</span>
          </div>
          <div className={ styles['contenedor-checks'] }>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
              <label className="form-check-label" htmlFor="flexCheckDefault">
                Acepto los términos y condiciones de la compra
              </label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
              <label className="form-check-label" htmlFor="flexCheckDefault">
                Me gustaría recibir noticias, actualizaciones o información de Pullman Bus
              </label>
            </div>
          </div>
        </div>
        <div className={ styles['contenedor-boton-pagar'] }>
          <button className={ styles['boton-pagar'] } onClick={ () => sendToPayment() }>Pagar</button>
        </div>
      </div>
    </div>
  );
};
