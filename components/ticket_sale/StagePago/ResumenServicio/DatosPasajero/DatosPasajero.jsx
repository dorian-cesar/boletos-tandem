import { useEffect, useState } from "react";
import styles from "./DatosPasajero.module.css";
import Rut from "rutjs";

import { useSelector, useDispatch } from "react-redux";
import {
  agregarInformacionAsiento,
  asignarDatosComprador,
} from "store/usuario/compra-slice";

const DatosPasajero = (props) => {
  const { servicio, asiento, usuario, pasajero = false } = props;
  const dispatch = useDispatch();

  const [cantidadEquipaje, setCantidadEquipaje] = useState(0);

  function retornarDatosCompradorUsuario() {
    let asientoTemporal = { ...asiento };
    asientoTemporal['nombre'] = usuario?.nombres;
    asientoTemporal['apellido'] = usuario?.apellidoPaterno;
    asientoTemporal['tipoDocumento'] = usuario?.tipoDocumento;
    asientoTemporal['rut'] = usuario?.rut;
    asientoTemporal['email'] = usuario?.mail;
    asientoTemporal['cantidadEquipaje'] = usuario?.cantidadEquipaje || 0;
    return asientoTemporal;
  }

  useEffect(() => {
    let asientoTemporal = { ...asiento };
    asientoTemporal["tipoDocumento"] = "R";
    const infoToDispatch = {
      servicio,
      asiento: asientoTemporal,
    };
    if (servicio) {
      dispatch(agregarInformacionAsiento(infoToDispatch));
    } else {
      const datosCompradorUsuario = retornarDatosCompradorUsuario();
      dispatch(asignarDatosComprador(usuario !== null ? datosCompradorUsuario : asientoTemporal));
    }
  }, []);

  useEffect(() => {
    if( usuario ) {
      const datosCompradorUsuario = retornarDatosCompradorUsuario();
      dispatch(asignarDatosComprador(datosCompradorUsuario));
    }
  }, [usuario])

  function setDataComprador({ name, value }) {
    try {
      let carro_temp = { ...asiento };

      if (asiento["tipoDocumento"] == "R" && name === "rut" && value !== "") {
        value = validarFormatoRut(name, value);
      }
      
      if (asiento["tipoDocumento"] == "R" && name === "rut" && value !== "") {
        value = value.replace(/[^\dkK0-9.-]/g, "");
        if (value.length > 12) return;
      }

      if( name === 'tipoDocumento') {
        carro_temp['rut'] = '';
      }

      carro_temp[name] = value;
      const infoToDispatch = {
        servicio,
        asiento: carro_temp,
      };

      if (servicio) {
        dispatch(agregarInformacionAsiento(infoToDispatch));

        //
        // TODO:
        // Para: Mi yo del futuro d=====(￣▽￣*)b
        // Posiblemente te digan, "oh, queremos que la mascotita tenga su nombre" a los chistosos se les ocurre cuestiones todos los dias
        // Aqui dejo una pista de que habria que borrar lo que esta abajo y validar que clase de información quieren (┬┬﹏┬┬)
        // Tambien en ResumenServicio.jsx habria que eliminar la validacion que no muestra el acordeon de rellenar ingormacion del pasajero
        // Eso TKM
        //
        if( asiento.asientoAsociado ) {
          debugger;
          let asientoMab = { ...servicio.asientos.find((asientoMab) => asientoMab.asiento === asiento.asientoAsociado) };
          asientoMab[name] = value;
          asientoMab["tipoDocumento"] = asiento.tipoDocumento;

          dispatch(agregarInformacionAsiento({
            servicio,
            asiento: asientoMab
          }));
        }
      } else {
        dispatch(asignarDatosComprador(carro_temp));
      }
    } catch ({ message }) {
      console.error(`Error al agregar informacion del comprador [${message}]`);
    }
  }

  useEffect(() => {
    try {
      let carro_temp = { ...asiento };
      carro_temp['cantidadEquipaje'] = cantidadEquipaje;
      
      const infoToDispatch = {
        servicio,
        asiento: carro_temp,
      };

      if (servicio) {
        dispatch(agregarInformacionAsiento(infoToDispatch));
      }

    } catch (error) {
      console.error(`Error al agregar informacion del comprador [${message}]`);
    }
  }, [cantidadEquipaje])

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
                disabled={ usuario }
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
                disabled={ usuario }
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
                    checked={asiento["tipoDocumento"] == "R" ? "checked" : ""}
                    value="R"
                    name="tipoDocumento"
                    disabled={ usuario }
                    onChange={(e) => setDataComprador(e.target)}
                  />
                  <span className="checkmark"></span>
                </label>
              </div>
              <div className={"col"}>
                <label className={"contenedor"}>
                  <label className={styles["label"]}>DNI/Pasaporte</label>
                  <input
                    type="checkbox"
                    checked={asiento["tipoDocumento"] == "P" ? "checked" : ""}
                    value="P"
                    name="tipoDocumento"
                    disabled={ usuario }
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
                disabled={ usuario }
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
                disabled={ usuario }
                onChange={(e) => setDataComprador(e.target)}
              />
            </div>
          </div>
          {
            pasajero == true && (
              <div className="col-12 col-md-12">
                <div className="row justify-content-around">
                  <div className="col-12 col-md-6">
                    <p>Debes indicar cuanto equipaje llevarás en el maletero:</p>
                  </div>
                  <div className="col-12 col-md-5 row justify-content-center gap-1 p-3">
                    <div className="col-2 col-md-3 d-flex justify-content-center p-0">
                      <button 
                        className={`btn btn-outline-secondary border-2 rounded-circle fw-bold fs-3 d-flex justify-content-center align-items-center ${ styles["button-baggage"] }`}
                        disabled={ cantidadEquipaje <= 0 }
                        onClick={ () => setCantidadEquipaje(cantidadEquipaje - 1) }>
                        -
                      </button>
                    </div>
                    <div className="col-2 col-md-3 d-flex justify-content-center p-0">
                      <span className={`fs-3 bg-secondary bg-opacity-25 d-flex justify-content-center rounded-circle align-items-center border border-2 border-secondary ${styles["button-baggage"]}`}>
                        { cantidadEquipaje }
                      </span>
                    </div>
                    <div className="col-2 col-md-3 d-flex justify-content-center p-0">
                      <button 
                        className={`btn btn-outline-secondary border-2 rounded-circle fw-bold fs-3 d-flex justify-content-center align-items-center ${ styles["button-baggage"] }`}
                        disabled={ cantidadEquipaje >= 1}
                        onClick={ () => setCantidadEquipaje(cantidadEquipaje + 1) }>
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        </div>
      </div>
    </>
  );
};

export default DatosPasajero;
