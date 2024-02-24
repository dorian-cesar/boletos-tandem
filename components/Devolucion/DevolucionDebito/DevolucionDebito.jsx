import styles from "./DevolucionDebito.module.css";
import React, { useState, useEffect } from "react";
import Rut from "rutjs";
import axios from "axios";
import { useForm } from "/hooks/useForm";
import Popup from "../../Popup/Popup";
import ModalEntities from "../../../entities/ModalEntities";

const anularDatosForm = {
  boleto: [],
  codigoTransaccion: "",
  rutSolicitante: "",
  usuario: "",
  banco: "",
  tipoCuenta: "",
  numeroCuenta: "",
  rutTitular: "",
  email: "",
};

const DevolucionDebito = (props) => {
  const { selectedBoletos, codigoTransaccion, tipoCompra, setStage, toast } = props;
  const [boletos, setBoletos] = useState("");
  const [tipoCuentas, setTipoCuentas] = useState([]);
  const [tipoCuenta, setTipoCuenta] = useState(null);
  const [bancos, setBancos] = useState([]);
  const [banco, setBanco] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { formState: registro, onInputChange } = useForm(anularDatosForm);

  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [mostrarPopupFinalizar, setMostrarPopupFinalizar] = useState(false);

  const [error, setError] = useState({
    errorMsg: "",
    status: false,
  });

  const abrirPopup = () => {
    setMostrarPopup(true);
  };
  const cerrarPopup = () => {
    setMostrarPopup(false);
  };

  const abrirPopupFinalizar = () => {
    setMostrarPopupFinalizar(true);
  };


  async function obtenerBancos() {
    let data = await axios.post("/api/bancos", {});
    setBancos(data.data.object);
  }

  async function obtenerTipoBanco() {
    if (selectedBoletos.length > 0) {
      if (tipoCompra === "VD") {
        let codigo = "VD";
        let resp = await axios.post("/api/tipo-cuenta", { codigo });
        if (resp.data) {
          setTipoCuentas(resp.data?.object);
        }
      } else {
        let codigo = "VN";
        let resp = await axios.post("/api/tipo-cuenta", { codigo });
        if (resp.data) {
          setTipoCuentas(resp.data?.object);
        }
      }
    }
  }

  async function confirmarAnulacion() {
    abrirPopup();
  }

  async function anular() {
    let boleto = selectedBoletos;
    registro.boleto = boleto;
    registro.banco = banco;
    registro.tipoCuenta = tipoCuenta;
    registro.codigoTransaccion = codigoTransaccion;
    const formStatus = await validarForm();
    if (formStatus) {
      try {
        setIsLoading(true);
        let resp = await axios.post("/api/anulacion", { ...registro });
        if (resp.data.status) {
          setIsLoading(false);
          abrirPopupFinalizar();
        }
      } catch (e) {
        if (!!e.response) {
          const { message } = e.response?.data;
          setError({ status: true, errorMsg: message });
        } else {
          setError({ status: true, errorMsg: "Ocurrió un error inesperado." });
        }
        setIsLoading(false);
      }
    }
  }

  function validarForm() {
    return new Promise((resolve, reject) => {
      const values = Object.values(registro);
      const camposVacios = values.filter((v) => v == "");
      if (camposVacios.length > 0) {
        cerrarPopup();
        toast.warn(
            `Asiento seleccionado superara el máximo de compra permitido`,
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              
            }
          );
        resolve(false);
      } else {
        let rutSolicitante = new Rut(registro?.rutSolicitante);
        let rutTitular = new Rut(registro?.rutTitular);
        if (!rutSolicitante?.isValid) {
          setError({
            status: true,
            errorMsg: "Se requiere ingresar un rut válido solicitante",
          });
          return resolve(false);
        }
        if (!rutTitular?.isValid) {
          setError({
            status: true,
            errorMsg: "Se requiere ingresar un rut válido titular",
          });
          return resolve(false);
        }

        setError({ status: false, errorMsg: "" });
        resolve(true);
      }
    });
  }

  useEffect(() => {
    (async () => await obtenerBancos())();
    (async () => await obtenerTipoBanco())();
  }, []);

  useEffect(() => {
    if (selectedBoletos.length > 0) {
      setBoletos((prevBoletos) => {
        let newBoletos = "";
        selectedBoletos.forEach((item, index) => {
          newBoletos += (index > 0 ? " " : "") + item;
        });
        return newBoletos;
      });
    }
  }, [selectedBoletos]);

  function volverAtras() {
    setStage(2);
  }

  function volverAlInicio() {
    setStage(0);
  }

  return (
    <>
      <div className={styles["container"]}>
        <div className={"fila"}>
          <div className={styles["title"]}>Devolución de boleto</div>
          <div className={styles["sub-title"]}>
            Los boletos{" "}
            <span className={styles["text-remarcado"]}>{boletos}</span> que
            pertenecen al codigo de transacción{" "}
            <span className={styles["text-remarcado"]}>
              {codigoTransaccion}
            </span>{" "}
            fueron adquiridos con tarjeta de debito por lo que debes tener
            presente lo siguiente:
          </div>
          <div className={styles["sub-title-details"]}>
            &#8226; La devolución tarda 5 días hábiles para las compras con
            tarjeta de crédito bancarias y de casas comerciales. Dicho cargo se
            revertirá en el siguiente o subsiguiente estado de pago, según el
            banco o casa comercial emisora de la tarjeta.
          </div>
          <div className={styles["sub-title-details"]}>
            &#8226; Revisa los datos que se encuentran a continuación, si están
            incorrecto toma captura de pantalla y envia la información a
            <span className={styles["text-remarcado"]}>
              {" "}
              clientes@pullmanbus.cl
            </span>
            .
          </div>
          <br></br>
          <div className={"fila"}>
            <div className={"row"}>
              <div className={"col-10"}>
                <div className={"row justify-content-center"}>
                  <div className={"col-5"}>
                    <label className={styles["text-label"]}>Nombre</label>
                    <input
                      type="text"
                      name="usuario"
                      placeholder="Nombre titular"
                      className={styles["input"]}
                      value={registro?.usuario}
                      onChange={onInputChange}
                    />
                  </div>

                  <div className={"col-3"}>
                    <label className={styles["text-label"]}>
                      Rut solicitante
                    </label>
                    <input
                      type="text"
                      name="rutSolicitante"
                      placeholder="Rut solicitante : 11111111-1"
                      className={styles["input"]}
                      value={registro?.rutSolicitante}
                      onChange={onInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={"row"}>
              <div className={"col-10"}>
                <div className={"row justify-content-center"}>
                  <div className={"col-5"}>
                    <label className={styles["text-label"]}>E-mail</label>
                    <input
                      type="text"
                      name="email"
                      placeholder="Email"
                      className={styles["input"]}
                      value={registro?.email}
                      onChange={onInputChange}
                    />
                  </div>
                  <div className={"col-3"}>
                    <label className={styles["text-label"]}>
                      Rut titular cuenta
                    </label>
                    <input
                      type="text"
                      name="rutTitular"
                      placeholder="Rut del titular de la cuenta : 11111111-1"
                      className={styles["input"]}
                      value={registro?.rutTitular}
                      onChange={onInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={"row"}>
              <div className={"col-10"}>
                <div className={"row justify-content-center"}>
                  <div className={"col-5"}>
                    <label className={styles["text-label"]}>Banco</label>
                    <select
                      name="banco"
                      id="cars"
                      className={styles["input"]}
                      value={banco}
                      onChange={(e) => setBanco(e.target.value)}
                    >
                      <option value="">Seleccione banco</option>
                      {bancos.map((banco) => (
                        <option value={banco.codigo}>{banco.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className={"col-3"}>
                    <label className={styles["text-label"]}>
                      Tipo de cuenta
                    </label>
                    <select
                      name="tipoCuenta"
                      id="cars"
                      className={styles["input"]}
                      value={tipoCuenta}
                      onChange={(e) => setTipoCuenta(e.target.value)}
                    >
                      <option value="">Seleccione tipo cuenta</option>
                      {tipoCuentas.map((tipoCuenta) => (
                        <option value={tipoCuenta?.codigo}>
                          {tipoCuenta?.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className={"row"}>
              <div className={"col-10"}>
                <div className={"row justify-content-center"}>
                  <div className={"col-5"}>
                    <label className={styles["text-label"]}>N° de cuenta</label>
                    <input
                      type="text"
                      name="numeroCuenta"
                      placeholder="Número de cuenta"
                      className={styles["input"]}
                      value={registro?.numeroCuenta}
                      onChange={onInputChange}
                    />
                  </div>

                  <div className={"col-3"}></div>
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
                  boletos
                    ? styles["button-continue"]
                    : styles["button-continue-disabled"]
                }
                onClick={() => {
                  boletos ? confirmarAnulacion() : "";
                }}
              >
                Anular
              </div>
            </div>
          </div>
        </div>
        {mostrarPopup && (
          <Popup
            modalKey={ModalEntities.confirm_return}
            modalClose={cerrarPopup}
            modalMethods={anular}
          />
        )}
        {mostrarPopupFinalizar && (
          <Popup
            modalKey={ModalEntities.annulation_success}
            modalMethods={volverAlInicio}
          />
        )}
        
      </div>
    </>
  );
};

export default DevolucionDebito;
