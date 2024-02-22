import styles from "./BusquedaBoletos.module.css";
import axios from "axios";
import { useEffect, useState, forwardRef } from "react";

const BusquedaBoletos = (props) => {
  const { setStage, setBoletos, setLoadingBoleto} = props;
  const [codigoTransaccion, setCodigoTransaccion] = useState("");

  async function validarTransaccion() {
    setLoadingBoleto(true);
    let codigo = codigoTransaccion;
    let resp = await axios.post("/api/devolucion-boletos", { codigo });
    if (resp.data) {
      setBoletos(resp.data?.object);
      setStage(1);
      setLoadingBoleto(false);
    } else {
      toast.error(resp.data.error, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
      });
      setLoadingBoleto(false);
    }
  }

  return (
    <>
      <div className={styles["container"]}>
        <div className="row search-row">
          <div className="col-12 col-md-6 col-lg-2">
            <div className={styles["grupo-campos"]}>
              <label>Código de transacción:</label>
              <input
                type="text"
                placeholder="Ej: HRJAS12FDA"
                className={styles["input"]}
                value={codigoTransaccion}
                onChange={(e) => setCodigoTransaccion(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-12 col-lg-2">
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
      </div>
    </>
  );
};

export default BusquedaBoletos;
