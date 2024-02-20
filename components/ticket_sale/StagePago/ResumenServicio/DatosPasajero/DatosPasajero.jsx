import { useEffect, useState } from "react";
import styles from "./DatosPasajero.module.css";
import Rut from "rutjs";

import { useSelector, useDispatch } from "react-redux";
import { agregarInformacionAsiento, asignarDatosComprador } from "store/usuario/compra-slice";

const DatosPasajero = (props) => {

  const { servicio, asiento } = props;
  const dispatch = useDispatch();
  
  const [carro, setCarro] = useState({
    datos: { tipoRut: "rut" },
  });

  function setDataComprador({ name, value }) {
    try {
      debugger;
      let carro_temp = { ...asiento };
      if ( !carro_temp.tipoRut ) {
        carro_temp['tipoRut'] = "rut";
      }
      value = validarFormatoRut(name, value);
      carro_temp[name] = value;
      const infoToDispatch = {
        servicio,
        asiento: carro_temp,
      }

      if( servicio ) {
        dispatch(agregarInformacionAsiento(infoToDispatch));
      } else {
        dispatch(asignarDatosComprador(carro_temp));
      }
    } catch ({ message }) {
      console.error(`Error al agregar informacion del comprador [${message}]`);
    }
  }

  function validarFormatoRut(name, value) {
    try {
      if (name.trim() == "rut" && value.length > 2) {
        let rut = new Rut(value);
        value = new Rut(rut.getCleanRut().replace("-", "")).getNiceRut(true);
      }
      return value;
    } catch ({ message }) {
      console.error(`Error al validar formato de rut [${message}]`);
    }
  }

  return (
    <>
      <div className={styles["container"]}>
        <div className={"row"}>
          <div className={"col-12 col-md-6"}>
            <div className={"grupo-campos"}>
              <label className={styles["label"]}>Nombres</label>
              <input
                type="text"
                value={asiento["nombre"]}
                name="nombre"
                placeholder="Ej: Juan Andrés"
                className={styles["input"]}
                onChange={(e) => setDataComprador(e.target)}
              />
            </div>
          </div>
          <div className={"col-12 col-md-6"}>
            <div className={"grupo-campos"}>
              <label className={styles["label"]}>Apellidos</label>
              <input
                type="text"
                value={asiento["apellido"]}
                name="apellido"
                placeholder="Ej: Espinoza Arcos"
                className={styles["input"]}
                onChange={(e) => setDataComprador(e.target)}
              />
            </div>
          </div>
          <div className={"col-12 col-md-6"}>
            <div className={"row"}>
              <div className={"col"}>
                <label className={"contenedor"}>
                  <label className={styles["label"]}>rut</label>
                  <input
                    type="checkbox"
                    checked={asiento["tipoRut"] == "rut" ? "checked" : ""}
                    value="rut"
                    name="tipoRut"
                    onChange={(e) => setDataComprador(e.target)}
                  />
                  <span className="checkmark"></span>
                </label>
              </div>
              <div className={"col"}>
                <label className={"contenedor"}>
                  <label className={styles["label"]}>pasaporte</label>
                  <input
                    type="checkbox"
                    checked={
                      asiento["tipoRut"] == "pasaporte" ? "checked" : ""
                    }
                    value="pasaporte"
                    name="tipoRut"
                    onChange={(e) => setDataComprador(e.target)}
                  />
                  <span className={"checkmark"}></span>
                </label>
              </div>
            </div>
            <div className={"grupo-campos"}>
              <input
                type="text"
                value={asiento["rut"]}
                name="rut"
                placeholder="Ej: 111111111"
                className={`${
                  Array.isArray(asiento.errors) &&
                  asiento.errors.includes("rut")
                    ? "is-invalid"
                    : ""
                } ${styles["input"]}`}
                onChange={(e) => setDataComprador(e.target)}
              />
            </div>
          </div>
          <div className={"col-12 col-md-6"}>
            <div className={"row"}>
              <div className={"col"}>
                <label className={styles["container-text"]}>
                  <label className={styles["label"]}>E-mail</label>
                </label>
              </div>
              <div className={"col"}></div>
            </div>
            <div className={"grupo-campos"}>
              <input
                type="email"
                value={asiento["email"]}
                name="email"
                placeholder="Ej: correo@correo.cl"
                className={styles["input"]}
                onChange={(e) => setDataComprador(e.target)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DatosPasajero;
