import { useEffect, useState } from "react";
import styles from "./InformacionComprador.module.css";
import { useSelector, useDispatch } from "react-redux";
import Rut from "rutjs";
import { agregarComprador } from "../../../../store/usuario/compra-cuponera-slice";

const InformacionComprador = (props) => {
  const dispatch = useDispatch();

  const [carro, setCarro] = useState({
    datos: { tipoDocumento: "R" },
  });

  function setDataComprador({ name, value }) {
    try {
      let carro_temp = { ...carro };
      value = validarFormatoRut(name, value);

      if( carro.datos["tipoDocumento"] == "R" && name === 'rut' && value !== '' ) {
        value = value.replace(/[^\dkK0-9.-]/g,'');
        if( value.length > 12 ) return;
      }

      carro_temp.datos[name] = value;
      dispatch(agregarComprador(carro_temp.datos));
      setCarro(carro_temp);
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
              value={carro.datos["nombre"]}
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
              value={carro.datos["apellido"]}
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
                <label className={styles["label"]}>RUT</label>
                <input
                  type="checkbox"
                  checked={carro.datos["tipoDocumento"] == "R" ? "checked" : ""}
                  value="R"
                  name="tipoDocumento"
                  onChange={(e) => setDataComprador(e.target)}
                />
                <span className="checkmark"></span>
              </label>
            </div>
            <div className={"col"}>
              <label className={"contenedor"}>
                <label className={styles["label"]}>Pasaporte</label>
                <input
                  type="checkbox"
                  checked={carro.datos["tipoDocumento"] == "P" ? "checked" : ""}
                  value="P"
                  name="tipoDocumento"
                  onChange={(e) => setDataComprador(e.target)}
                />
                <span className={"checkmark"}></span>
              </label>
            </div>
          </div>
          <div className={"grupo-campos"}>
            <input
              type="text"
              value={carro.datos["rut"]}
              name="rut"
              placeholder="Ej: 111111111"
              className={`${
                Array.isArray(carro.datos.errors) &&
                carro.datos.errors.includes("rut")
                  ? "is-invalid"
                  : ""
              } ${styles["input"]}`}
              onChange={(e) => setDataComprador(e.target) }
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
              value={carro.datos["email"]}
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

export default InformacionComprador;
