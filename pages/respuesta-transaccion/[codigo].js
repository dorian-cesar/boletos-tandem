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
  const [passagers, setPassagers] = useState({});

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
    const storage = sessionStorage.getItem('purchase');

    if( !storage ) {
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
            idaNombre = `Salida, ${format(fechaIda, "ddd D MMM", "es")}`;
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
            vueltaNombre = `Vuelta, ${format(fechaVuelta, "ddd D MMM", "es")}`;
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

      debugger;

      const paymentMethod = props?.carro.carro.medioPago;
      const amount = props?.carro.carro.monto;
      const tickets = props.carro.carro.boletos;

      const transactionInfo = {
        transaction: props.codigo,
        detail: carro_temp,
        paymentMethod: paymentMethod,
        amount,
        tickets
      }

      setResumen(transactionInfo);

      sessionStorage.setItem('purchase', JSON.stringify(transactionInfo));

    } else {

      const purchaseStorage = JSON.parse(storage);
      if( purchaseStorage.transaction && purchaseStorage.transaction === props.codigo ) {
        setResumen(purchaseStorage);
      } else {
        sessionStorage.removeItem('purchase');
        obtenerInformacion();
      }

    }    
  };

  useEffect(() => {
    obtenerInformacion();
  }, []);
  
  useEffect(() => {
    getPassagersInfo();

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
    resumen.tickets.forEach( async (element) => {
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

  const getPassagersInfo = () => {
    let groupPassagers = {}
    const purchaseInfo = JSON.parse(sessionStorage.getItem('purchase_info'));
    if( purchaseInfo && purchaseInfo.length > 0 ) {
      purchaseInfo.forEach((purchase) => {
        purchase.asientos.forEach((seat) => {
          if( !seat.tipoMascota ) {
            groupPassagers[seat.rut] = {
              name: seat.nombre,
              lastName: seat.apellido,
              id: seat.rut,
              email: seat.email
            }
          }
        })
      })
    }
    setPassagers(groupPassagers);
  }

  return (
    <Layout>
      <div className="container my-4">
        {
          resumen ? (
            <div className="card text-center border-0 shadow-sm rounded-4">
              <div className="card-header bg-white border-0">
                <img src="/img/ui/transaction/transaction-success.svg" alt="confirmado"/>
              </div>
              <div className="card-body">
                <h1 className="fw-bold text-secondary">¡Muchas gracias por tu compra!</h1>
                <div className="container mt-3 mb-2">
                  <div className="row justify-content-center">
                    <p className="col-12 col-md-8">
                      Tú compra se ha realizado con éxito. Próximamente, recibirás un correo electronico con los boletos adquiridos.
                    </p>
                  </div>
                </div>
                <div className="container">
                  <div className="row justify-content-center">
                    <div className="col-12 col-md-6">
                      <div className="bg-secondary p-3 rounded-4 shadow-s" onClick={() => console.log(passagers) }>
                        <h5 className="text-white fw-bold m-0">Orden de compra: {resumen?.transaction}</h5>
                      </div>
                    </div>
                  </div>
                </div>
                {
                  passagers && (
                    <div className="mt-3">
                      <b>Datos de los pasajeros:</b>
                      <div className="container mt-3">
                        <div className="row justify-content-center gap-2">
                          { Object.entries(passagers).map(([key, value]) => (
                            <div className="col-12 col-md-3 text-center d-flex flex-col">
                              <h5 className="fw-bold">{value.name} {value.lastName}</h5>
                              <span>{value.id}</span>
                              <span>{value.email}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                }
                {
                  resumen?.detail?.carro?.lista && (
                    <div className="mt-4 dotted-top dotted-bottom pt-5">
                      <div className="container">
                        <div className="row justify-content-center gap-4">
                          { resumen?.detail?.carro?.lista.map((lista) => (
                            lista?.titulo && (
                              <div className="col-12 col-md-5">
                                <h6 className="fw-bold">{ lista?.titulo }</h6>
                                  { lista?.detalle.map((detalle, index) => (
                                    <div key={index} className={ `my-5 ${styles["detalle-item"]}` }>
                                      <ul>
                                        <li>
                                          <div>{detalle.origen}</div>
                                          <div>{detalle.hora}</div>
                                        </li>
                                        <li>
                                          <div>{detalle.destino}</div>
                                          <div>{detalle.horaLlegada}</div>
                                        </li>
                                      </ul>
                                      <div className={styles['resumen-servicio']}>
                                        <span>Cantidad de Asientos: {detalle.cantidadAsientos}</span>
                                        <b>{detalle.total}</b>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                }
                {
                  resumen?.paymentMethod && (
                    <div className="container dotted-bottom">
                      <div className="row justify-content-center gap-4 gap-md-2 py-4">
                        <div className="col-12 col-md-5 d-flex flex-col">
                          <strong className="text-start text-md-center">Pagado con:</strong>
                          <div className="d-flex gap-3 justify-content-center">
                            <span className="text-start text-md-center">{mediosPago[resumen.paymentMethod]?.mensaje || 'Pago electrónico'}</span>
                            <img src={mediosPago[resumen.paymentMethod]?.imagen || 'generico'} alt={`Icono ${mediosPago[resumen.paymentMethod]?.nombre}`}/>
                          </div>
                        </div>
                        <div className="col-12 col-md-5 d-flex flex-row justify-content-center gap-3">
                          <strong className="fs-3">Total Pagado:</strong>
                          <span className="fs-3 text-primary fw-bold">{clpFormat.format(resumen.amount)}</span>
                        </div>
                      </div>
                    </div>
                  )
                }
                <div className="container pb-3 pt-4">
                  <div className="row justify-content-evenly gap-5 gap-md-2">
                    <div className="col-12 col-md-5 d-flex justify-content-center align-self-center">
                      <img src='/img/icon/general/download-outline.svg' className="cursor-pointer" onClick={() => descargarBoletos()}/>
                      <span className="fw-bold text-decoration-underline cursor-pointer" onClick={() => descargarBoletos()}>
                        Descarga tus boletos aquí
                      </span>
                    </div>
                    <div className="col-12 col-md-5">
                      <Link href="/">
                        <div className="d-grid">
                          <button className="btn btn-primary rounded-4">
                            Volver al inicio
                          </button>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
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
          )
        }
      </div>
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
