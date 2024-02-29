import { useEffect, useRef, useState } from "react";
import styles from "./MediosPago.module.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { agregarMedioPago } from "store/usuario/compra-slice";

const MediosPago = (props) => {
  const [mediosPago, setMediosPago] = useState([]);
  const [selectedMedioPago, setSelectedMedioPago] = useState(null); // no se si los podemos controlar con el store para pagar
  const [codigoCuponera, setCodigoCuponera] = useState(""); // lo mismo cuando seleccionen cuponera guardar esos datos en el store para hacer validaciones

  const dispatch = useDispatch();
  const medioPago = useSelector((state) => state.compra.medioPago);

  const handleMedioPagoChange = (id) => {
    dispatch(agregarMedioPago(id));
    setSelectedMedioPago(medioPago);
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
        {mediosPago.map((element) => (
          <div key={element.id} className={styles["body-pay"]}>
            <input
              type="radio"
              id={element.id}
              name="medioPago"
              value={element.valor2}
              checked={selectedMedioPago === element.valor2}
              onChange={() => handleMedioPagoChange(element.valor2)}
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
        ))}

        {selectedMedioPago === "CUP" ? (
          <>
            <span className={styles["text-input-coupon"]}>
              {" "}
              Ingresa tu código de transacción aquí:{" "}
            </span>
            <input
              type="codigoCuponera"
              value={codigoCuponera}
              name="codigoCuponera"
              placeholder="Ej: XTQ1234567"
              className={styles["input-body"]}
              onChange={(e) => setCodigoCuponera(e.target.value)}
            />
          </>
        ) : null}
      </div>
    </>
  );
};

export default MediosPago;
