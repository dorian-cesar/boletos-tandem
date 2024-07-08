import axios from "axios";
import Layout from "components/Layout";
import Footer from "components/Footer";
import { useEffect, useState, forwardRef } from "react";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import getConfig from "next/config";
import Link from "next/link";
import styles from './RespuestaTransaccion.module.css';
import { useDispatch, useSelector } from "react-redux";
import { format } from "@formkit/tempo"
import { limpiarListaCarrito } from "store/usuario/compra-slice";

import { sendGTMEvent } from "@next/third-parties/google";


const { publicRuntimeConfig } = getConfig();
const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <input
    type="text"
    className="fecha-input form-control"
    onClick={onClick}
    ref={ref}
    value={value}
  />
));

const stages = [
  {
      name: "Servicio ida",
      kind: "pasajes_1",
  },
  {
      name: "Servicio vuelta",
      kind: "pasajes_2",
  },
  {
      name: "Pago",
      kind: "pago",
  },
  {
      name: "Confirmación",
      kind: "confirmacion",
  },
];

const mediosPago = {
  WBPAY: {
    nombre: "Webpay",
    mensaje: 'Débito RedCompra (WebPay)',
    imagen: "/img/icon/general/webpay.svg",
  }
}

export default function Home(props) {

  const [totalPagar, setTotalPagar] = useState(0);
  const [copiaCarro, setCopiaCarro] = useState({});
  const [resumen, setResumen] = useState({
    carro: {},
  });

  const clpFormat = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  });

  const carroCompras = useSelector((state) => state.compra?.listaCarrito) || [];

  const dispatch = useDispatch();

  const agregarEventoTagManager = () => {
    if( !props.carro || !resumen ) return; 
    try {
      sendGTMEvent({
        event: "purchase",
        value: {
          currency: "CLP",
          transaction_id: props.codigo,
          value: totalPagar
        }
      })
    } catch (error) {}
  }
  
  const obtenerInformacion = () => {
    {
      let carritoIda = {
        titulo: "",
        detalle: [],
      };
      let carritoVuelta = {
        titulo: "",
        detalle: [],
      };
      
      let idaNombre;
      let vueltaNombre;

      Object.keys(carroCompras).forEach((key) => {
        const compra = carroCompras[key];
        if (compra.ida && compra.ida.length > 0) {
          const fechaIdaFormateada = compra.ida[0].fechaSalida.split("/");
          const fechaIda = new Date(
            `${fechaIdaFormateada[1]}/${fechaIdaFormateada[0]}/${fechaIdaFormateada[2]}`
          );
          const idaList = compra.ida;
          idaList.forEach((value) => {
            const datos = {
              origen: `${value.terminalOrigen}`,
              destino: `${value.terminalDestino}`,
              hora: value.horaSalida,
              horaLlegada: value.horaLlegada,
              cantidadAsientos: 0,
              total: 0,
            };
            value.asientos.forEach((element) => {
              datos.cantidadAsientos += 1;
              datos.total += element.valorAsiento;
            });
            idaNombre = `Salida, ${format(fechaIda, "ddd D MMM")}`;
            datos.total = clpFormat.format(datos.total);
            carritoIda.detalle.push(datos);
          });
        }

        if (compra.vuelta && compra.vuelta.length > 0) {
          const fechaVueltaFormateada = compra.vuelta[0].fechaSalida.split("/");
          const fechaVuelta = new Date(
            `${fechaVueltaFormateada[1]}/${fechaVueltaFormateada[0]}/${fechaVueltaFormateada[2]}`
          );
          const vueltaList = compra.vuelta;
          vueltaList.forEach((value) => {
            const datos = {
              origen: `${value.terminalOrigen}`,
              destino: `${value.terminalDestino}`,
              hora: value.horaSalida,
              horaLlegada: value.horaLlegada,
              cantidadAsientos: 0,
              total: 0,
            };
            value.asientos.forEach((element) => {
              datos.cantidadAsientos += 1;
              datos.total += element.valorAsiento;
            });
            datos.total = clpFormat.format(datos.total);
            carritoVuelta.detalle.push(datos);
            vueltaNombre = `Vuelta, ${format(fechaVuelta, "ddd D MMM")}`;
          });
        }
      });

      const datos = [];
      carritoIda.titulo = idaNombre;
      carritoVuelta.titulo = vueltaNombre;
      datos.push(carritoIda);
      datos.push(carritoVuelta);
      const carro_temp = { ...resumen };
      carro_temp.carro["lista"] = datos;
      setResumen(carro_temp);
    }
  };

  useEffect(() => {
    obtenerInformacion();
  }, []);
  
  useEffect(() => {
    const carro = carroCompras || copiaCarro;
    let total = 0;
    Object.entries(carro).map(([key, value]) => {
      const idaList = value.ida || [];
      const vueltaList = value.vuelta || [];

      Object.entries(idaList).map(([key, value]) => {
        value.asientos.forEach((element) => {
          total += element.valorAsiento;
        });
      });

      Object.entries(vueltaList).map(([key, value]) => {
        value.asientos.forEach((element) => {
          total += element.valorAsiento;
        });
      });
    });

    setTotalPagar(total);
    dispatch(limpiarListaCarrito());
  }, [resumen])

  useEffect(() => agregarEventoTagManager(), [totalPagar]);

  const descargarBoletos = () =>{
    console.log(props);
    props.carro.carro.boletos.forEach( async (element) => {
      let boleto = {
        codigo: element.codigo,
        boleto: element.boleto
      }
        try {
        const res = await axios.post("/api/voucher", boleto);
        if (res.request.status) {
           const linkSource = `data:application/pdf;base64,${res.data?.archivo}`;
           const downloadLink = document.createElement("a");
           const fileName = res.data.nombre;
           downloadLink.href = linkSource;
           downloadLink.download = fileName;
           downloadLink.click();
        }
      } catch (e) {}
    });
  }
  return (
    <Layout>
      {props.carro ? (
        <>
          <section className={ styles['main-section'] }>
            <div className={ styles['images-container'] }>
              <img src="/img/ticket-outline.svg" alt="ticket" className={ styles['ticket-image'] } />
              <img src="/img/checkmark-circle-outline.svg" alt="confirmado" className={ styles['confirmado-image'] } />
            </div>
            <h1>¡Muchas gracias por tu compra!</h1>
            <span className={ styles['compra-realizada'] }>Tu compra se ha realizado con éxito. Próximamente, recibirás un correo electrónico con los boletos adquiridos.</span>
            <div className={ styles['orden-compra'] }>
              <span>Orden de compra: {props.codigo}</span>
            </div>
            <section className={ styles['detalle-viajes'] }>
              {Array.isArray(resumen.carro.lista) &&
                resumen.carro.lista.map((element) => (
                  element.titulo && 
                  (<div className={styles["servicio-ida"]} key={element.titulo}>
                    <b className={ styles['titulo-servicio'] }>{ element.titulo }</b>
                    <div className={styles["detalle-container"]}>
                      {Array.isArray(element.detalle) &&
                        element.detalle.map((detalleItem, index) => (
                          <div key={index} className={styles["detalle-item"]}>
                            <ul>
                              <li>
                                <div>{ detalleItem.origen }</div>
                                <div>{ detalleItem.hora }</div>
                              </li>
                              <li>
                                <div>{ detalleItem.destino }</div>
                                <div>{ detalleItem.horaLlegada }</div>
                              </li>
                            </ul>
                            <div className={ styles['resumen-servicio'] }>
                              <span>Cantidad de Asientos: {detalleItem.cantidadAsientos}</span>
                              <b>{ detalleItem.total }</b>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>)
                ))}
            </section>
            <section className={ styles['resumen-pago'] }>
              <div className={ styles['contenedor-metodo-pago'] }>
                <strong>Pagado con:</strong>
                <span>
                  { mediosPago[props.carro.carro.medioPago].mensaje } 
                  <img src={ mediosPago[props.carro.carro.medioPago].imagen } alt={ `Icono ${mediosPago[props.carro.carro.medioPago].nombre}` }/>
                </span>
              </div>
              <div className={ styles['contenedor-total-pagar'] }>
                <strong>Total Pagado:</strong>
                <span>{ clpFormat.format(props?.carro?.carro?.monto) }</span>
              </div>
            </section>
            <section className={ styles['action-container'] }>
              <div className={ styles['contenedor-descarga-boletos']}>
                <img src='/img/icon/general/download-outline.svg' />
                <span onClick={()=> descargarBoletos()}>
                  Descarga tus boletos aquí
                </span>
              </div>
              <div className={ styles['contenedor-volver-inicio'] }>
                <Link href="/" className={ styles['btn'] }>
                  Volver al inicio
                </Link>
              </div>
            </section>
          </section>
        </>
      ) : (
        <>
          <div className="row justify-content-center mb-5">
            <div className="text-center mt-5">
              <h1>Lo sentimos 😢,</h1>
              <h2>no se pudo llevar a cabo la transacción</h2>
              <h2>de tu compra.</h2>
            </div>
            <div className="text-center mt-5">
              <h5>Por favor, intentelo nuevamente.</h5>
            </div>
            <div className="mt-5 mb-5 col-lg-2">
              <Link className="btn-outline" href="/">
                Salir
              </Link>
            </div>
          </div>
        </>
      )}
      <Footer />
    </Layout>
  );
}

export const getServerSideProps = withIronSessionSsr(async function (context) {
  let carro = {};

  try {
    carro = await axios.post(
      publicRuntimeConfig.site_url + "/api/carro",
      context.query
    );
  } catch (error) {}

  return {
    props: {
      codigo: context.query.codigo || "",
      token: context.query.token_ws || "",
      carro: carro.data || null,
    },
  };
}, sessionOptions);
