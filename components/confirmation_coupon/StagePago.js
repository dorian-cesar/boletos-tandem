import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Rut from "rutjs";

import { PasajeConvenioDTO } from "dto/PasajesDTO";
import { GuardarCarroDTO, PasajePagoDTO } from "dto/PasajesDTO";
import ResumenPasaje from "./ResumenPasaje";
import InformacionPasajero from "./InformacionPasajero";
import InformacionComprador from "./InformacionComprador";
import { isValidPasajero } from "utils/user-pasajero";
import { toast } from "react-toastify";

const StagePago = (props) => {
  const { carro, nacionalidades, convenios, mediosDePago, setCarro } = props;

  const [convenioSelected, setConvenioSelected] = useState(null);
  const [convenio, setConvenio] = useState(null);
  const [payment, setPayment] = useState({});
  const [convenioActive, setConvenioActive] = useState(null);
  const [convenioFields, setConvenioFields] = useState({});
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

  function getSubtotal(clientes, clean) {
    try {
      return clientes.reduce(
        (valorAcumulado, { tarifa, origen, asiento, piso }) => {
          tarifa = tarifa.replace(".", ",");
          const precio =
            !clean && convenioActive
              ? obtenerPagoConvenioActivo(origen, asiento, piso)
              : Number(tarifa.replace(/[^\d.-]/g, ""));
          valorAcumulado += precio;
          return valorAcumulado;
        },
        0
      );
    } catch ({ message }) {
      console.error(`Error al obtener el sub total [${message}]`);
    }
  }

  function getTotal() {
    try {
      const ida = getSubtotal(carro.clientes_ida);
      const vuelta = getSubtotal(carro.clientes_vuelta);
      return Number(ida) + Number(vuelta);
    } catch ({ message }) {
      console.error(`Error al obtener el total [${message}]`);
    }
  }

  function isPaymentValid() {
    try {
      let isValid = true;

      const pasajerosIda = carro.clientes_ida.reduce(
        (valorIncial, pasajeroRecorrido, indexPasajero) => {
          if (
            !isValidPasajero(
              pasajeroRecorrido.pasajero,
              indexPasajero,
              "ida",
              setCarro,
              carro
            )
          ) {
            valorIncial = false;
          }
          return valorIncial;
        },
        true
      );

      if (!pasajerosIda) {
        isValid = false;
      }

      return isValid;
    } catch ({ message }) {
      console.error(`Error al validar el pago [${message}]`);
    }
  }

  async function sendToPayment() {
    try {
      if (!isPaymentValid()) return;
      let pasajes = [
        ...carro.clientes_ida.map((clientesIdaMapped, clientesIdaIndex) => {
          const pasajero = clientesIdaMapped.pet
            ? carro.clientes_ida[clientesIdaIndex - 1]
            : clientesIdaMapped.pasajero;
          const convenioActivo = convenioActive
            ? convenioActive.idConvenio
            : "";
          const datoConvenio = convenioActive
            ? convenioActive.listaAtributo[0].valor
            : "";
          const precioConvenio = convenioActive
            ? Number(
                convenioActive.listaBoleto.find(
                  (boleto) =>
                    boleto.origen == clientesIdaMapped.origen &&
                    boleto.asiento == clientesIdaMapped.asiento &&
                    boleto.piso == clientesIdaMapped.piso
                ).pago
              )
            : clientesIdaMapped.tarifa.replace(",", "");
          return new PasajePagoDTO(
            clientesIdaMapped,
            pasajero,
            clientesIdaMapped.extras,
            convenioActivo,
            precioConvenio,
            datoConvenio
          );
        }),
      ];

      const { email, rut } = carro.datos;

      const { data } = await axios.post(
        "/api/guardar-carro",
        new GuardarCarroDTO(email, rut, getTotal(), pasajes)
      );

      if (Boolean(data.error)) {
        toast.error(data.error.message || "Error al completar la transacción", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return;
      }

      setPayment({
        ...payment,
        url: data.url,
        token: data.token,
      });
    } catch ({ response }) {
      toast.error(
        response.data.message || "Error al completar la transacción",
        {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
        }
      );
    }
  }

  function obtenerCantidadAsientos(tipoClientes) {
    const listaServicios = carro[tipoClientes].reduce(
      (valorInicial, valorActual) => {
        if (!valorInicial[valorActual.servicio]) {
          valorInicial[valorActual.servicio] = [];
        }
        valorInicial[valorActual.servicio].push(valorActual);
        return valorInicial;
      },
      {}
    );

    return Object.keys(listaServicios).map((servicio) => (
      <>
        <div className="row">
          <div className="col-8">
            <h4>
              {listaServicios[servicio].length}X boleto {servicio}
            </h4>
          </div>
          <div className="col-4 d-flex justify-content-end">
            <h3>
              ${getSubtotal(listaServicios[servicio]).toLocaleString("es")}
            </h3>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <p>Precio Normal</p>
          </div>
          <div className="col-4 d-flex justify-content-end">
            <h4 className="tachado">
              $
              {(
                Math.round(
                  (getSubtotal(listaServicios[servicio], true) * 1.12) / 100
                ) * 100
              ).toLocaleString("es")}
            </h4>
          </div>
        </div>
      </>
    ));
  }

  useEffect(() => {
    if (payment.url) {
      payment_form.current?.submit();
    }
  }, [payment]);

  return (
    <div className="row">
      <div className="col-12 col-md-8">
        <div className="bloque bg-white pasajeros">
          <h2>Registro de pasajero</h2>

          {carro.clientes_ida.map((clienteMapped, indexCliente) => {
            return (
              <InformacionPasajero
                key={`key-informacion-pasajero-ida-${indexCliente}`}
                tipoViaje={"ida"}
                cliente={clienteMapped}
                index={indexCliente}
                nacionalidades={nacionalidades}
                carro={carro}
                setCarro={setCarro}
                validarFormatoRut={validarFormatoRut}
              />
            );
          })}
        </div>
        <InformacionComprador
          setCarro={setCarro}
          carro={carro}
          validarFormatoRut={validarFormatoRut}
        />
      </div>

      <div className="col-12 col-md-4">
        <div className="bloque bg-white pasajeros">
          <h2>Resumen de compra</h2>
          <ResumenPasaje tipoPasaje={"IDA"} pasaje={carro.pasaje_ida} />
          <div className="row">
            <div className="col-12 col-md-9">
              <div className="row cantidad-asiento mb-5">
                <div className="col-8">
                  <div className="row">
                    <div className="col-12">
                      <strong>IDA</strong>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-8">
                      <h5>Cantidad de asientos</h5>
                    </div>
                    <div className="col-4"></div>
                  </div>
                  {obtenerCantidadAsientos("clientes_ida")}
                </div>
              </div>
            </div>
            <div className="col-12 col-md-5 total-pagar">
              <div className="row">
                <div className="col-6 d-flex align-items-center">
                  <h3>Total a pagar:</h3>
                </div>
                <div className="col-6 d-flex justify-content-end">
                  <h2>${getTotal().toLocaleString("es")}</h2>
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
                    className={"btn " + (!isPaymentValid() ? "disabled" : "")}
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

export default StagePago;
