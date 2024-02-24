import styles from "./BoletosSeleccion.module.css";
import { useEffect, useState, forwardRef } from "react";

const BoletosSeleccion = (props) => {
  const {
    setStage,
    boletos,
    setLoadingBoleto,
    selectedBoletos,
    setSelectedBoletos,
  } = props;

  const handleCheckboxChange = (boleto) => {
    const isSelected = selectedBoletos.includes(boleto);
    if (isSelected) {
      setSelectedBoletos(
        selectedBoletos.filter((selected) => selected !== boleto)
      );
    } else {
      setSelectedBoletos([...selectedBoletos, boleto]);
    }
  };

  function volverAtras() {
    setStage(0);
  }
  function siguiente() {
    setStage(2);
  }

  return (
    <div className={styles["container"]}>
      <div className={"fila"}>
        <div className={styles["title"]}>Devolución de boleto</div>
        <div className={styles["sub-title"]}>
          Selecciona el o los boleto(s) que deseas anular:
        </div>
        {boletos.map((element) => (
          <div key={element.boleto}>
            <div className="row">
              <div className={styles["body-pay"]}>
                <div className={"row"}>
                  <div className="col-5"></div>
                  <div className="col-6"></div>
                  <div className="col-1">
                    {element.estado === "NUL" ? (
                      <br></br>
                    ) : (
                      <input
                        type="checkbox"
                        id={element.boleto}
                        name="boleto"
                        value={element.boleto}
                        checked={selectedBoletos.includes(element.boleto)}
                        onChange={() => handleCheckboxChange(element.boleto)}
                      />
                    )}
                  </div>
                </div>
                <div className={"row"}>
                  <div className="col-5">
                    <span className={styles["text-origen"]}>
                      {" "}
                      {element.imprimeVoucher.nombreCiudadOrigen}
                    </span>
                  </div>
                  <div className="col-3"></div>
                  <div className="col-4">
                    <span className={styles["text-destino"]}>
                      {" "}
                      {element.imprimeVoucher.nombreCiudadDestino}
                    </span>
                  </div>
                </div>
                <br></br>
                <div className={"row"}>
                  <div className="col-3"></div>
                  <div className="col-4"></div>
                </div>
                <div className={"row"}>
                  <div className="col-5">
                    <span className={styles["text-estado"]}> Estado</span>
                  </div>
                  <div className="col-3">
                    <span className={styles["text-valor"]}> Valor</span>
                  </div>
                  <div className="col-4">
                    <span className={styles["text-codigo"]}>
                      {" "}
                      Código boleto
                    </span>
                  </div>
                </div>
                <div className={"row"}>
                  <div className="col-5">
                    <span className={styles["text-estado-valor"]}>
                      {" "}
                      {element.estado === "ACT" ? "Activa" : "Nula"}
                    </span>
                  </div>
                  <div className="col-3">
                    <span className={styles["text-valor-boleto"]}>
                      {" "}
                      ${element.imprimeVoucher.total}
                    </span>
                  </div>
                  <div className="col-4">
                    <span className={styles["text-codigo-boleto"]}>
                      {" "}
                      {element.boleto}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        

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
              className={styles["button-continue"]}
              onClick={() => {
                siguiente();
              }}
            >
              Continuar
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoletosSeleccion;
