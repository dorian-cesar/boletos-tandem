import styles from "./BoletosSeleccion.module.css";
import { useEffect, useState, forwardRef } from "react";
import { toast } from "react-toastify";

const estadoBoleto = {
  'ACT': 'Activo',
  'NUL': 'Nulo',
  'VEN': 'Fuera de plazo',
  'NOP': 'No se puede anular',
  'CAN': 'Cambiado'
}

const BoletosSeleccion = (props) => {
  const {
    setStage,
    boletos,
    setLoadingBoleto,
    selectedBoletos,
    setSelectedBoletos,
  } = props;

  async function handleCheckboxChange(boleto) {
    const isSelected = selectedBoletos.includes(boleto.boleto);
    if (!isSelected) {
      if (boleto.asientoAsociado > 0) {
        const associatedBoletos = boletos.filter((element) => element.asiento === boleto.asientoAsociado && boleto?.imprimeVoucher?.servicio === element?.imprimeVoucher?.servicio);
        const associatedBoletosIds = associatedBoletos.map((item) => item.boleto);
        const newSelectedBoletos = new Set(selectedBoletos);
        newSelectedBoletos.add(boleto.boleto);
        associatedBoletosIds.forEach((codigoBoleto) => {
        newSelectedBoletos.add(codigoBoleto);
        });
        setSelectedBoletos(Array.from(newSelectedBoletos));
        return;
      }
      setSelectedBoletos([...selectedBoletos, boleto.boleto]);
    } else {
      if (boleto.asientoAsociado > 0) {
        const associatedBoletos = boletos.filter((element) => element.asiento === boleto.asientoAsociado && boleto?.imprimeVoucher?.servicio === element?.imprimeVoucher?.servicio);
        const associatedBoletosIds = associatedBoletos.map((item) => item.boleto);
        const newSelectedBoletos = new Set(selectedBoletos);
        associatedBoletosIds.forEach((codigoBoleto) => {
          newSelectedBoletos.delete(codigoBoleto);
        });
        newSelectedBoletos.delete(boleto.boleto);
        setSelectedBoletos(Array.from(newSelectedBoletos));
        return
      }   
      const newSelectedBoletos = selectedBoletos.filter((selected) => selected !== boleto.boleto);
      setSelectedBoletos(newSelectedBoletos);
    }
  };
  
  function volverAtras() {
    setSelectedBoletos([]);
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
          <div key={element.boleto} className={"row"}>
            <div className={"col-12"}>
            <div className="row d-flex justify-content-center">
              <div className={styles["body-pay"]}>
                <div className={"row d-flex"}>
                  <div className="d-flex justify-content-end">
                    <div className="d-flex">{
                      element.asientoAsociado > 0 ? <img
                      src="img/icon/buttons/paw-outline-orange.svg"
                    /> : ""
                    }</div>
                    <div className="d-flex">
                      <input
                        type="checkbox"
                        id={element.boleto}
                        name="boleto"
                        value={element.boleto}
                        checked={selectedBoletos.includes(element.boleto)}
                        onChange={() => handleCheckboxChange(element)}
                        disabled={ element.estado !== 'ACT'}
                      />
                    </div>
                  </div>
                </div>
                <div className={ `row ${ styles["contenedor-ciudades"]}`}>
                  <div className="col-5 mb-2">
                    <span className={styles["text-origen"]}>
                      {element.imprimeVoucher.nombreCiudadOrigen}
                    </span>
                  </div>
                  <div className="col-3"></div>
                  <div className="col-4 mb-2">
                    <span className={styles["text-destino"]}>
                      {element.imprimeVoucher.nombreCiudadDestino}
                    </span>
                  </div>
                </div>
                <div className={ styles["logo"] }>
                  <img src="img/icon-barra.svg" />
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
                      { estadoBoleto[element.estado] }
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
              Regresar
            </div>
          </div>
          <div className={"col-12 col-md-6"}>
            <div
              className={ (selectedBoletos.length > 0) ? styles["button-continue"] : styles["button-continue-disabled"]} 
              onClick={() => {
                (selectedBoletos.length > 0) ? siguiente() : "";
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
