import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import styles from "./ResumenPago.module.css";
import { useSelector, useDispatch } from "react-redux";
import { isValidDatosComprador } from "utils/user-pasajero";
import { toast } from "react-toastify";
import { agregarMontoTotal } from "../../../../store/usuario/compra-cuponera-slice";

const ResumenPago = (props) => {
  const [resumen, setResumen] = useState({
    carro: {},
  });
  const clpFormat = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  });
  const [totalPagar, setTotalPagar] = useState(0);
  const [soloLectura, setSoloLectura] = useState(false);
  const [saldoMonederoVirtual, setSaldoMonederoVirtual] = useState(
    clpFormat.format(0)
  );

  const { setMedioDePago, carro } = props;
  const payment_form = useRef(null);
  const [payment, setPayment] = useState({});
  const carroCuponera = useSelector(
    (state) => state.compraCuponera.carroCuponera
  );
  const cuerpo = useSelector((state) => state.compraCuponera);
  const dispatch = useDispatch();
  const [isChecked, setIsChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [promotionsChecked, setPromotionsChecked] = useState(false);
  
  async function pagar() {
    if (isPaymentValid()) {
      dispatch(agregarMontoTotal(carroCuponera));

      try {
        const { data } = await axios.post(
          "/api/coupon/guardar-cuponera",
          cuerpo
        );
        setPayment({
          ...payment,
          url: data.url,
          token: data.token,
        });
      } catch ({ response }) {
        console.log("error", response);
      }
    }
  }

  function isPaymentValid() {
    try {
      let isValid = true;
      if (!isValidDatosComprador(cuerpo)) {
        isValid = false;
      }
      return isValid;
    } catch ({ message }) {
      console.error(`Error al validar el pago [${message}]`);
    }
  }

  useEffect(() => {
    if (payment.url) {
      payment_form.current?.submit();
    }
  }, [payment]);

  return (
    

      <div className={styles["resumen-container"]}>{
        console.log('datos', carroCuponera)
      }
        <h3>Resumen del viaje</h3>
        <div className={styles["contenedor-servicios"]}>
          <div className={styles["servicio-ida"]}>
            <b className={styles["titulo-servicio"]}>{carroCuponera.nombreCuponera}</b>
            <div className={styles["detalle-container"]}>
              <div className={styles["detalle-item"]}>
                <ul>
                  <li>
                    <div>{carroCuponera.origenDescripcion}</div>
                  </li>
                  <li>
                    <div>{carroCuponera.destinoDescripcion}</div>
                  </li>
                </ul>
                <div className={styles["resumen-servicio"]}>
                  <span>
                    Cantidad de cupones: {carroCuponera.cantidadCupones} {(carroCuponera.cuponesExtras > 0) ? " + "+ carroCuponera.cuponesExtras+" cupon extra":""}
                  </span>
                  <b>{carroCuponera.valorTotalCuponera}</b>
                </div>
              </div>
            </div>
          </div>
          <div className={styles["total-container"]}>
            {!soloLectura && (
              <div
                className={`form-check form-switch ${styles["utiliza-monedero-virtual"]}`}
              >
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="flexSwitchCheckDefault"
                />
                <label
                  className="form-check-label"
                  htmlFor="flexSwitchCheckDefault"
                >
                  Utilizar monedero virtual ({saldoMonederoVirtual})
                </label>
                <img src="/img/icon/general/information-circle-outline.svg" />
                <span className={styles["tooltip-text"]}>
                  Sólo se puede pagar con el monedero cuando inicies sesión.
                </span>
              </div>
            )}
            <div className={styles["contanedor-total-pagar"]}>
              <span>Total a pagar: {clpFormat.format(carroCuponera.valorTotalCuponera)}</span>
            </div>
            {!soloLectura && (
              <div className={styles["contenedor-checks"]}>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={termsChecked}
                    onChange={() => setTermsChecked(!termsChecked)}
                    id="flexCheckDefault"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexCheckDefault"
                  >
                    Acepto los términos y condiciones de la compra
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={promotionsChecked}
                    onChange={() => setPromotionsChecked(!promotionsChecked)}
                    id="flexCheckDefault"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexCheckDefault"
                  >
                    Me gustaría recibir noticias, actualizaciones o información
                    de Pullman Bus
                  </label>
                </div>
              </div>
            )}
          </div>
          {!soloLectura && (
            <div className={styles["contenedor-boton-pagar"]}>
              <button
                className={
                  termsChecked && isPaymentValid()
                    ? styles["boton-pagar"]
                    : styles["boton-pagar-disabled"]
                }
                onClick={() => {
                  if (termsChecked && isPaymentValid()) {
                    pagar();
                  }
                }}
              >
                Pagar
              </button>
              <form
                ref={payment_form}
                style={{ display: "none" }}
                method="POST"
                action={payment.url}
              >
                <input name="TBK_TOKEN" value={payment.token} />
              </form>
            </div>
          )}
        </div>
      </div>

  );
};

export default ResumenPago;
