import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Rut from "rutjs";

import { PasajeConvenioDTO } from "dto/PasajesDTO";
import { GuardarCarroCuponeraDTO, PasajePagoDTO } from "dto/PasajesDTO";
import ResumenCuponera from "./ResumenCuponera";
import InformacionCompradorCuponera from "./InformacionCompradorCuponera";
import { isValidPasajero } from "utils/user-pasajero";
import { toast } from "react-toastify";

const StagePagoCuponera = (props) => {
  console.log("que era esto", props);
  const { carro, nacionalidades, convenios, mediosDePago, setCarro } = props;
  const [convenioSelected, setConvenioSelected] = useState(null);
  const [convenio, setConvenio] = useState(null);
  const [convenioActive, setConvenioActive] = useState(null);
  const [convenioFields, setConvenioFields] = useState({});
  const [payment, setPayment] = useState({});

  const payment_form = useRef(null);

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

  function getTotal() {
    try {
      const ida = props.carro.cuponeraCompra.valorTotalCuponera;
      return Number(ida);
    } catch ({ message }) {
      console.error(`Error al obtener el total [${message}]`);
    }
  }

  function isPaymentValid() {
    try {
      let isValid = true;

      return isValid;
    } catch ({ message }) {
      console.error(`Error al validar el pago [${message}]`);
    }
  }

  async function sendToPayment() {

    const { email, rut } = carro.datos;

    try {
      const { data } = await axios.post(
        "/api/coupon/guardar-cuponera",
        new GuardarCarroCuponeraDTO(email, rut, getTotal(), props.carro.cuponeraCompra)
      );

      console.log('informacion a guardar', data)
      setPayment({
        ...payment,
        url: data.url,
        token: data.token,
      });
    } catch ({ response }) {
      console.log('error' , response)
    }
  }

  useEffect(() => {
    if (payment.url) {
      payment_form.current?.submit();
    }
  }, [payment]);

  return (
    <div className="pago">
      <div className="container">
        <InformacionCompradorCuponera
          setCarro={setCarro}
          carro={carro}
          validarFormatoRut={validarFormatoRut}
        />

        <div className="bloque comprador  bg-white">
          <h2>Resumen de compra</h2>
          <div className="row">
            <div className="col-12 col-md-7">
              <div className="row">
                <div className="col-6 d-flex align-items-center">
                  <h5>Cuponera </h5>
                </div>
                <div className="col-6 d-flex justify-content-end">
                  <h2>{props.carro.cuponeraCompra.nombreCuponera}</h2>
                </div>
              </div>
              <div className="row">
                <div className="col-6 d-flex align-items-center">
                  <h5>Cupones </h5>
                </div>
                <div className="col-6 d-flex justify-content-end">
                  <h2>{props.carro.cuponeraCompra.cantidadCupones}</h2>
                </div>
              </div>
              <div className="row">
                <div className="col-6 d-flex align-items-center">
                  <h5>Valor por cupon</h5>
                </div>
                <div className="col-6 d-flex justify-content-end">
                  <h2>${props.carro.cuponeraCompra.valorCupon}</h2>
                </div>
              </div>
              <div className="row">
                <div className="col-6 d-flex align-items-center">
                  <h5>Valor total</h5>
                </div>
                <div className="col-6 d-flex justify-content-end">
                  <h2>${getTotal()}</h2>
                </div>
              </div>
              <div className="row">
                <div className="col-6 d-flex align-items-center">
                  <h5>Origen </h5>
                </div>
                <div className="col-6 d-flex justify-content-end">
                  <h2>{props.carro.cuponeraCompra.origenDescripcion}</h2>
                </div>
              </div>
              <div className="row">
                <div className="col-6 d-flex align-items-center">
                  <h5>Destino </h5>
                </div>
                <div className="col-6 d-flex justify-content-end">
                  <h2>{props.carro.cuponeraCompra.destinoDescripcion}</h2>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-5 total-pagar">
              <div className="row">
                <div className="col-6 d-flex align-items-center">
                  <h3>Total a pagar:</h3>
                </div>
                <div className="col-6 d-flex justify-content-end">
                  <h2>${getTotal()}</h2>
                </div>
              </div>
              <div className="row my-5">
                <div className="col-12">
                  {mediosDePago.map(({ imagen }, indexImagen) => (
                    <img
                      key={`key-imagen-medio-pago-${indexImagen}`}
                      src={"data:image/png;base64," + imagen}
                    />
                  ))}
                </div>
                <div className="col-12 p-2">
                  <label className="d-flex align-items-baseline mb-3 mt-3">
                    <input type="checkbox" className="mr-2" />
                    <small>
                      He leido los{" "}
                      <a href="/terminos" target="_blank">
                        Terminos y Condiciones
                      </a>{" "}
                      de la compra
                    </small>
                  </label>
                  <label className="d-flex align-items-baseline">
                    <input type="checkbox" className="mr-2" />
                    <small>
                      Me gustaria recibir noticias, actualizaciones o
                      información de Pullman Bus
                    </small>
                  </label>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <a
                    href="#"
                    className={"btn " + (!isPaymentValid() ? "" : "")}
                    disabled={!isPaymentValid()}
                    onClick={(e) => {
                      e.preventDefault();
                      sendToPayment();
                    }}
                  >
                    Pagar
                  </a>

                  <form
                    ref={payment_form}
                    style={{ display: "none" }}
                    method="POST"
                    action={payment.url}
                  >
                    <input name="TBK_TOKEN" value={payment.token} />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StagePagoCuponera;
