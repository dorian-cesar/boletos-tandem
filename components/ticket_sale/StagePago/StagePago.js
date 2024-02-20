import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Rut from "rutjs";

import { PasajeConvenioDTO } from "dto/PasajesDTO";
import { GuardarCarroDTO, PasajePagoDTO } from "dto/PasajesDTO";
import ResumenPasaje from "../ResumenPasaje";
import InformacionPasajero from "../InformacionPasajero";
import InformacionComprador from "../InformacionComprador";
import { isValidPasajero } from "utils/user-pasajero";
import { toast } from "react-toastify";
import Acordeon from "../../Acordeon/Acordeon";
import ResumenServicio from "./ResumenServicio/ResumenServicio";
import PuntoEmbarque from "./ResumenServicio/PuntoEmbarque/PuntoEmbarque";
import DatosPasajero from "./ResumenServicio/DatosPasajero/DatosPasajero";
import MediosPago from "./ResumenServicio/MediosPago/MediosPago"

import styles from "./StagePago.module.css";
import { ResumenViaje } from "../ResumenViaje/ResumenViaje";

import { useDispatch, useSelector } from "react-redux";
import { asignarDatosComprador } from "store/usuario/compra-slice";

const StagePago = (props) => {
  const { carro, nacionalidades, convenios, mediosDePago, setCarro } = props;

  const informacionAgrupada = useSelector((state) => state.compra.informacionAgrupada);
  const datosComprador = useSelector((state) => state.compra.datosComprador);

  const dispatch = useDispatch();

  const [convenioSelected, setConvenioSelected] = useState(null);
  const [convenio, setConvenio] = useState(null);
  const [convenioActive, setConvenioActive] = useState(null);
  const [convenioFields, setConvenioFields] = useState({});
  const [payment, setPayment] = useState({});
  const [usaDatosPasajeroPago, setUsaDatosPasajeroPago] = useState(false);

  const payment_form = useRef(null);

  useEffect(() => {
    if( usaDatosPasajeroPago ) {
      dispatch(asignarDatosComprador(informacionAgrupada[0].asientos[0]));
    } else {
      dispatch(asignarDatosComprador({}));
    }
  }, [usaDatosPasajeroPago])

  async function getConvenio() {
    try {
      const convenio_response = await axios.post("/api/ticket_sale/convenio", {
        idConvenio: convenioSelected,
      });
      setConvenio(convenio_response.data);
      setConvenioFields({});
    } catch ({ message }) {
      console.error(`Error al obtener convenio [${message}]`);
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

  async function validarConvenio() {
    try {
      const pasajes = [
        ...carro.clientes_ida.map(
          (pasajeIda) => new PasajeConvenioDTO(pasajeIda)
        ),
        ...carro.clientes_vuelta.map(
          (pasajeVuelta) => new PasajeConvenioDTO(pasajeVuelta)
        ),
      ];

      const { data } = await axios.post("/api/ticket_sale/validar-convenio", {
        convenio: convenioSelected,
        fields: convenioFields,
        pasajes: pasajes,
      });

      if (data.mensaje == "OK" && Number(data.descuento) > 0) {
        setConvenioActive(data);
      }
    } catch ({ message }) {
      console.error(`Error al validar convenio [${message}]`);
    }
  }

  function convenioField({ name, value }) {
    try {
      let convenioFieldsTemp = { ...convenioFields };
      convenioFieldsTemp[name] = value;
      setConvenioFields(convenioFieldsTemp);
    } catch ({ message }) {
      console.error(`Error al asignar convenio [${message}]`);
    }
  }

  function obtenerPagoConvenioActivo(origen, asiento, piso) {
    try {
      return Number(
        convenioActive.listaBoleto.find(
          (boleto) =>
            boleto.origen == origen &&
            boleto.asiento == asiento &&
            boleto.piso == piso
        )
      );
    } catch ({ message }) {
      console.error(`Error al obtener pago convenio [${message}]`);
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

      const pasajerosVuelta = carro.clientes_vuelta.reduce(
        (valorIncial, pasajeroRecorrido, indexPasajero) => {
          if (
            !isValidPasajero(
              pasajeroRecorrido.pasajero,
              indexPasajero,
              "vuelta",
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

      if (!pasajerosIda || !pasajerosVuelta) {
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
        ...carro.clientes_vuelta.map(
          (clientesVueltaMapped, clientesVueltaIndex) => {
            const pasajero = clientesVueltaMapped.pet
              ? carro.clientes_ida[clientesVueltaIndex - 1]
              : clientesVueltaMapped.pasajero;
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
                      boleto.origen == clientesVueltaMapped.origen &&
                      boleto.asiento == clientesVueltaMapped.asiento &&
                      boleto.piso == clientesVueltaMapped.piso
                  ).pago
                )
              : clientesVueltaMapped.tarifa.replace(",", "");
            return new PasajePagoDTO(
              clientesVueltaMapped,
              pasajero,
              clientesVueltaMapped.extras,
              convenioActivo,
              precioConvenio,
              datoConvenio
            );
          }
        ),
      ];

      const { email, rut } = carro.datos;

      const { data } = await axios.post(
        "/api/ticket_sale/guardar-carro",
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

  function retornarFormularioConvenio() {
    const formularioConvenio = convenio.map(
      (formularioConvenio, indexFormularioConvenio) => (
        <div
          key={`frm-convenio-key-${indexFormularioConvenio}`}
          className="grupo-campos mt-5"
        >
          <label>{formularioConvenio.tipo}</label>
          <input
            onChange={(e) => convenioField(e.target)}
            value={convenioFields[formularioConvenio.tipo]}
            type={formularioConvenio.tipoInput}
            name={formularioConvenio.tipo}
            className="form-control"
          />
        </div>
      )
    );
    return (
      <>
        {formularioConvenio}
        <a
          className="btn"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            validarConvenio();
          }}
        >
          Validar Convenio
        </a>
      </>
    );
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
    (async () => await getConvenio())();
  }, [convenioSelected]);

  useEffect(() => {
    if (payment.url) {
      payment_form.current?.submit();
    }
  }, [payment]);

  return (
    <main className={styles["main-content"]}>
      <section className={ styles['info-list'] }>
        <ResumenServicio />
        <Acordeon title="Datos del comprador">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" value={ usaDatosPasajeroPago } id="flexCheckDefault" onChange={ () => setUsaDatosPasajeroPago(!usaDatosPasajeroPago) }/>
            <label className="form-check-label" htmlFor="flexCheckDefault">
              Usar los datos del pasajero 1
            </label>
          </div> 
          <DatosPasajero asiento={ datosComprador }/>
        </Acordeon>
        <Acordeon 
            title="Punto de embarque" 
            children={<PuntoEmbarque />}/>
        <Acordeon 
            title="Medio de pago" 
            children={<MediosPago />} />
      </section>
      <section className={styles["travel-summary"]}>
        <ResumenViaje />
      </section>
    </main>

    // <div className='pago'>

    //     <div className='container'>
    //         <div className='bloque bg-white pasajeros'>
    //             <h2>Registro de pasajeros</h2>
    //             <ResumenPasaje tipoPasaje={ 'IDA' } pasaje={ carro.pasaje_ida }/>
    //             {
    //                 carro.clientes_ida.map((clienteMapped, indexCliente) => {
    //                 return (
    //                     <InformacionPasajero
    //                         key={ `key-informacion-pasajero-ida-${ indexCliente }` }
    //                         tipoViaje={ 'ida' }
    //                         cliente={ clienteMapped }
    //                         index={ indexCliente }
    //                         nacionalidades={ nacionalidades }
    //                         carro={ carro }
    //                         setCarro={ setCarro }
    //                         validarFormatoRut={ validarFormatoRut }/>
    //                 );
    //             })}
    //             {
    //                 carro.pasaje_vuelta ? (
    //                     <>
    //                         <ResumenPasaje tipoPasaje={ 'VUELTA' } pasaje={ carro.pasaje_vuelta }/>
    //                         {
    //                             carro.clientes_vuelta.map((clienteMapped, indexCliente) => {
    //                                 return (
    //                                     <InformacionPasajero
    //                                         key={ `key-informacion-pasajero-vuelta-${ indexCliente }` }
    //                                         tipoViaje={ 'ida' }
    //                                         cliente={ clienteMapped }
    //                                         index={ indexCliente }
    //                                         nacionalidades={ nacionalidades }
    //                                         carro={ carro }
    //                                         setCarro={ setCarro }
    //                                         validarFormatoRut={ validarFormatoRut }/>
    //                                 );
    //                             }
    //                         )}
    //                     </>
    //                 ) : ('')
    //             }
    //         </div>

    //         <InformacionComprador setCarro={ setCarro } carro={ carro } validarFormatoRut={ validarFormatoRut }/>

    //         <div className='d-flex'>
    //             <div className='col-12 col-md-12 m-1'>
    //                 <div className='bloque  bg-white'>
    //                     <h2>Convenios</h2>
    //                     <div className='grupo-campos mt-5'>
    //                         <label className='label-input input-op'>
    //                             Convenios
    //                         </label>
    //                         <select
    //                             name='convenios'
    //                             id='cars'
    //                             className='form-control seleccion'
    //                             value={ convenioSelected }
    //                             onChange={ (e) => setConvenioSelected(e.target.value) }>
    //                             <option value=''>
    //                                 Seleccione Convenio
    //                             </option>
    //                             {
    //                                 convenios.map((convenioMapped) => (
    //                                     <option value={ convenioMapped.idConvenio }>
    //                                         { convenioMapped.descripcion }
    //                                     </option>
    //                                 ))
    //                             }
    //                         </select>
    //                     </div>
    //                     {
    //                         convenio ? retornarFormularioConvenio() : ('')
    //                     }
    //                 </div>
    //             </div>
    //         </div>
    //         <div className='bloque comprador  bg-white'>
    //             <h2>Resumen de compra</h2>
    //             <div className='row'>
    //                 <div className='col-12 col-md-7'>
    //                     {
    //                         carro.clientes_ida ? (
    //                             <div className='row cantidad-asiento mb-5'>
    //                                 <div className='col-8'>
    //                                     <div className='row'>
    //                                         <div className='col-12'>
    //                                             <strong>IDA</strong>
    //                                         </div>
    //                                     </div>
    //                                     <div className='row'>
    //                                         <div className='col-8'>
    //                                             <h5>Cantidad de asientos</h5>
    //                                         </div>
    //                                         <div className='col-4'></div>
    //                                     </div>
    //                                     {
    //                                         obtenerCantidadAsientos('clientes_ida')
    //                                     }
    //                                 </div>
    //                             </div>
    //                         ) : ('')
    //                     }
    //                     {
    //                         carro.clientes_vuelta ? (
    //                             <div className='row cantidad-asiento mb-5'>
    //                                 <div className='col-8'>
    //                                     <div className='row'>
    //                                         <div className='col-12'>
    //                                             <strong>VUELTA</strong>
    //                                         </div>
    //                                     </div>
    //                                     <div className='row'>
    //                                         <div className='col-8'>
    //                                             <h5>Cantidad de asientos</h5>
    //                                         </div>
    //                                         <div className='col-4'></div>
    //                                     </div>
    //                                     {
    //                                         obtenerCantidadAsientos('clientes_vuelta')
    //                                     }
    //                                 </div>
    //                             </div>
    //                         ) : ('')
    //                     }
    //                 </div>
    //                 <div className='col-12 col-md-5 total-pagar'>
    //                     <div className='row'>
    //                         <div className='col-6 d-flex align-items-center'>
    //                             <h3>Total a pagar:</h3>
    //                         </div>
    //                         <div className='col-6 d-flex justify-content-end'>
    //                             <h2>${ getTotal().toLocaleString('es') }</h2>
    //                         </div>
    //                     </div>
    //                     <div className='row my-5'>
    //                         <div className='col-12'>
    //                             {
    //                                 mediosDePago.map(({ imagen }, indexImagen) => (
    //                                     <img
    //                                         key={ `key-imagen-medio-pago-${ indexImagen }`}
    //                                         src={'data:image/png;base64,' + imagen }/>
    //                                 ))
    //                             }
    //                         </div>
    //                         <div className='col-12 p-2'>
    //                             <label className='d-flex align-items-baseline mb-3 mt-3'>
    //                                 <input type='checkbox' className='mr-2'/>
    //                                 <small>
    //                                     He leido los{' '}
    //                                     <a href='/terminos' target='_blank'>
    //                                         Terminos y Condiciones
    //                                     </a>{' '}
    //                                     de la compra
    //                                 </small>
    //                             </label>
    //                             <label className='d-flex align-items-baseline'>
    //                                 <input type='checkbox' className='mr-2'/>
    //                                 <small>Me gustaria recibir noticias, actualizaciones o información de Pullman Bus</small>
    //                             </label>
    //                         </div>
    //                     </div>
    //                     <div className='row'>
    //                         <div className='col-12'>
    //                             <a
    //                                 href='#'
    //                                 className={ 'btn ' + (!isPaymentValid() ? 'disabled' : '') }
    //                                 disabled={ !isPaymentValid() }
    //                                 onClick={ (e) => {
    //                                     e.preventDefault();
    //                                     sendToPayment();
    //                                 }}
    //                             >
    //                                 Pagar
    //                             </a>

    //                             <form ref={ payment_form } style={{ display: 'none', }} method='POST' action={ payment.url }>
    //                                 <input name='TBK_TOKEN' value={ payment.token }/>
    //                             </form>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // </div>
  );
};

export default StagePago;
