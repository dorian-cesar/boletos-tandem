import { useEffect, useRef, useState } from "react";
import styles from "./MediosPago.module.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { agregarMedioPago } from "store/usuario/compra-slice";

const MediosPago = (props) => {
  const {mediosPago, setMediosPago, setMedioPago} = props;
  const [selectedMedioPago, setSelectedMedioPago] = useState(null); 
  const [codigoCuponera, setCodigoCuponera] = useState("");

  const dispatch = useDispatch();

  const handleMedioPagoChange = ({ name, value }) => {
    try {
      setMedioPago(value);
      setSelectedMedioPago(value)
    } catch ({ message }) {
      console.error(`Error al agregar informacion del comprador [${message}]`);
    }
  };

  useEffect(
    () =>
      async function obtenerMediosPagos() {
        const { data } = await axios.post(
          "/api/ticket_sale/obtener-medios-pago",
          {}
        );
        setMediosPago(data);
      },
    []
  );

  return (
    <>
      <div className={styles["container"]}>
        {mediosPago.map((element) =>
          element.valor2 === "WBPAY" ? (
            <div key={element.id} className={styles["body-pay"]}>
              <input
              type="radio"
              id={element.id}
              name="medioPago"
              value={element.valor2}
              checked={selectedMedioPago === element.valor2}
              onClick={(e) => handleMedioPagoChange(e.target)}
            />
              {element.valor2 === "WBPAY" ? (
                <img src="/img/icon/cuponera/Logo-webpay.svg"></img>
              ) : (
                <label
                  className={
                    element.valor2 === "CUP" ? styles["text-coupon"] : ""
                  }
                  htmlFor={element.id}
                >
                  {element?.valor1}
                  <img src="/img/icon/cuponera/ticket-outline.svg"></img>
                </label>
              )}
            </div>
          ) : null
        )}
      </div>
    </>
  );
};

export default MediosPago;
