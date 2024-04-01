import styles from "./ModoDevolucion.module.css";
import { toast } from "react-toastify";

const ModoDevolucion = (props) => {
  const { medioDevolucion, setMedioDevolucion, setStage } = props;

  const handleMedioDevolucionChange = (e) => {
    setMedioDevolucion(e.target.value);
  };

  function volverAtras() {
    setStage(1);
  }

  function siguiente() {
    setStage(3);
  }

  return (
    <>
      <div className={styles["container"]}>
        <div className={"fila"}>
          <div className={styles["title"]}>Devolución de boleto</div>
          <div className={styles["sub-title"]}>
            Antes de efectuar la anulación del pasaje, selecciona la opción qué
            más te acomoda:
          </div>

          <div className={"col-12"}>
            <div className={"row justify-content-center mb-3"}>
              <div className={styles["dotted"]}></div>
            </div>
          </div>
          <div className={"col-12"}>
            <div className={"row justify-content-center"}>
              <div className={"col-6"}>
                <div className={styles["option-normal"]}>
                  <div>
                    <input
                      type="checkbox"
                      checked={medioDevolucion === "normal"}
                      value="normal"
                      name="medioDevolucion"
                      onChange={handleMedioDevolucionChange}
                    />
                    <label className={styles["label"]}>
                      &nbsp; Devolución al medio de pago
                    </label>
                  </div>
                  <div>
                    <div className={styles["option-text"]}>
                      Puedes solicitar la devolución de los pasajes al mismo
                      medio de pago, aunque la empresa se reserva el derecho de
                      retener el 15% del valor del pasaje (Art. 67d.s. 212),
                      siendo la devolución del 85% del valor del pasaje.
                    </div>
                  </div>
                </div>
              </div>
              <div className={"col-5"}>
                <div className={styles["option-normal"]}>
                  <div>
                    <input
                      type="checkbox"
                      checked={medioDevolucion === "monedero"}
                      value="monedero"
                      name="medioDevolucion"
                      onChange={handleMedioDevolucionChange}
                      disabled
                    />
                    <label className={styles["label"]}>
                      {" "}
                      &nbsp; Monedero Virtual
                    </label>
                  </div>
                  <div>
                    <div className={styles["option-text"]}>
                      Puedes pasar el 100% valor del pasaje al monedero virtual,
                      pero una vez en el monedero el dinero no puede ser
                      transferido a una cuenta débito o ser solicitado en
                      efectivo en nuestras boleterías ya que se asumirá que será
                      utilizado en un próximo viaje.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={"row"}>
            <div className={"col-12 col-md-6"}>
              <div
                className={styles["button-back"]}
                onClick={() => {
                  volverAtras();
                }}
              >
                regresar
              </div>
            </div>
            <div className={"col-12 col-md-6"}>
              <div
                className={
                  medioDevolucion
                    ? styles["button-continue"]
                    : styles["button-continue-disabled"]
                }
                onClick={() => {
                  medioDevolucion ? siguiente() : "";
                }}
              >
                Continuar
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModoDevolucion;
