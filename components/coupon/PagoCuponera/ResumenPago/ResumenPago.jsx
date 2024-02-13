import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import styles from "./ResumenPago.module.css";
import { useSelector, useDispatch } from "react-redux";
import { isValidDatosComprador } from "utils/user-pasajero";
import { toast } from "react-toastify";
import { agregarMontoTotal } from "../../../../store/usuario/compra-cuponera-slice"


const ResumenPago = (props) => {
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

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handleTermsChange = () => {
    setTermsChecked(!termsChecked);
  };

  const handlePromotionsChange = () => {
    setPromotionsChecked(!promotionsChecked);
  };

  async function pagar() {
    if (isPaymentValid()) {
      dispatch(agregarMontoTotal(carroCuponera))
      
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
        console.log('error' , response)
      }
    }
  };

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
    <div className={styles["container"]}>
      <div className={styles["title"]}>Resumen del viaje</div>
      <div className={styles["name-coupon"]}>
        {carroCuponera.nombreCuponera}
      </div>
      <div className={styles["content-title"]}>
        Duración: {carroCuponera.diasDuracion} días para uso a partir del día de
        compra
      </div>
      <div className={styles["content-detail"]}>
        Cantidad cupones {carroCuponera.cantidadCupones}
      </div>
      <div className={styles["content-detail"]}>
        Cantidad cupones extras {carroCuponera.cuponesExtras}
      </div>
      <div className={styles["dotted-line"]}></div>
      <div className={styles["switch"]}>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="flexSwitchCheckDefault"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
          <label className="form-check-label" htmlFor="flexSwitchCheckDefault">
            <div className={styles["title"]}>
              Utilizar Monedero Virtual ($0)
            </div>
          </label>
        </div>
      </div>
      <div className={styles["dotted-line"]}></div>
      <div className={styles["pay-title"]}>
        Total a pagar: $ {carroCuponera.valorTotalCuponera}
      </div>
      <div className={styles["check"]}>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            value=""
            id="flexCheckTerms"
            checked={termsChecked}
            onChange={handleTermsChange}
          />
          <label className="form-check-label" htmlFor="flexCheckTerms">
            <div className={styles["check-title"]}>
              Acepto los términos y condiciones de la compra
            </div>
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            value=""
            id="flexCheckPromotions"
            checked={promotionsChecked}
            onChange={handlePromotionsChange}
          />
          <label className="form-check-label" htmlFor="flexCheckPromotions">
            <div className={styles["check-title"]}>
              Me gustaría recibir noticias, actualizaciones o información de
              Pullman Bus
            </div>
          </label>
        </div>
        <div className={styles["button"]}>
          <div
            className={
              termsChecked && isPaymentValid()
                ? styles["button-pay"]
                : styles["button-pay-disabled"]
            }
            onClick={() => {
              if (termsChecked && isPaymentValid()) {
                pagar();
              }
            }}
          >
            Pagar
          </div>
          <form
            ref={payment_form}
            style={{ display: "none" }}
            method="POST"
            action={payment.url}
          >
            <input name="TBK_TOKEN" value={payment.token} />
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResumenPago;
