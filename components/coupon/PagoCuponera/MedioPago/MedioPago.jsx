import styles from "./MedioPago.module.css";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { agregarMedioPago } from "../../../../store/usuario/compra-cuponera-slice";
import axios from "axios";

const MedioPago = () => {
  const [mediosPago, setMediosPago] = useState([]);
  const [selectedMedioPago, setSelectedMedioPago] = useState(null);
  const dispatch = useDispatch();

  const [carro, setCarro] = useState({
    datos: {},
  });

  function setDataMedioPago({ name, value }) {
    try {
      let carro_temp = { ...carro };
      carro_temp.datos[name] = value;
      dispatch(agregarMedioPago(carro_temp.datos));
      setCarro(carro_temp);
    } catch ({ message }) {
      console.error(`Error al agregar informacion del comprador [${message}]`);
    }
  }

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

        element.valor2 === "WBPAY" ?    
          <div key={element.id} className={styles["body-pay"]}>
                <input
                  type="radio"
                  id={element.id}
                  name='tipoMedioPago'
                  value={element.valor2}
                  checked={ carro.datos['tipoMedioPago'] === element.valor2 ? 'checked' : '' }
                  onChange={ (e) => setDataMedioPago(e.target) }
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
         : null

        ))}
      </div>
    </>
  );
};

export default MedioPago;
