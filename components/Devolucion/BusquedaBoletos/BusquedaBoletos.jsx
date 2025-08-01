import styles from "./BusquedaBoletos.module.css";
import axios from "axios";
import { useEffect, useState, forwardRef } from "react";
import  {toast}  from "react-toastify";
import ModalEntities from "../../../entities/ModalEntities";
import Popup from "../../Popup/Popup";

const BusquedaBoletos = (props) => {
  const { setStage, setBoletos, setLoadingBoleto, codigoTransaccion, setCodigoTransaccion } = props;
  const [mostrarPopup, setMostrarPopup] = useState(false);

  const abrirPopup = () => {
    setMostrarPopup(true);
  };
  const cerrarPopup = () => {
    setMostrarPopup(false);
  };

  async function validarTransaccion() {
    setLoadingBoleto(true);
    let codigo = codigoTransaccion;
    let data;
    try {
      const response = await axios.post("/api/devolucion-boletos", { codigo });
      data = response.data;
      setBoletos(data?.object);
      setStage(1);
      setLoadingBoleto(false);
    } catch (error) {
      data = error.response.data;
      abrirPopup();
      setLoadingBoleto(false);
    }
  }

  const handleCodigoTransaccionChange = (e) => {
    setCodigoTransaccion(e.target.value.toUpperCase());
  };


  return (
    <>
      <div className={styles["container"]}>
      <div className={`search-row ${styles["search-row"]}`}>
        <div className={ styles['search-row-container'] }>
          <div className={styles["grupo-campos"]}>
            <label>Código de transacción:</label>
            <input
              type="text"
              placeholder="Ej: HRJAS12FDA"
              className={styles["input"]}
              value={codigoTransaccion}
              onChange={handleCodigoTransaccionChange}
            />
          </div>
          <div className={styles["grupo-campos"]}>
            <div
              className={
                codigoTransaccion
                  ? styles["button-search-coupon"]
                  : styles["button-search-coupon-disabled"]
              }
              onClick={codigoTransaccion ? validarTransaccion : null}
            >
              <img src="../img/icon/cuponera/search-outline.svg" /> Buscar
            </div>
          </div>
        </div>
        </div>
        {mostrarPopup && (
          <Popup
            modalKey={ModalEntities.info_bad_return}
            modalMethods={cerrarPopup}
            modalClose={cerrarPopup}
          />
        )}
      </div>
    </>
  );
};

export default BusquedaBoletos;
