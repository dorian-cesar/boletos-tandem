import axios from "axios";
import Layout from "components/Layout";
import Footer from "components/Footer";
import { forwardRef } from "react";
import { sessionOptions } from "lib/session";
import getConfig from "next/config";
import Link from "next/link";
import { withIronSessionSsr } from "iron-session/next";
import styles from "./RespuestaTransaccionConfirmacion.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { limpiarListaCarrito } from "store/usuario/compra-slice";
import { limpiarCambio } from "store/usuario/cambio-boleto-slice" 

const { publicRuntimeConfig } = getConfig();

export default function Home(props) {
  const dispatch = useDispatch();
  const [respuestaConfirmacion, setRespuestaConfirmacion] = useState({
    voucher: {
      fechaSalida: "",
      horaSalida: "",
      nombreClase: "",
      nombreTerminalDestino: "",
      nombreTerminalOrigen: "",
      petService: false,
      piso: "",
      servicio: "",
      total: "",
    },
  });

  const cambioRespuesta = useSelector((state) => state.cambioBoleto);

  useEffect(() => {
    if (cambioRespuesta?.resultado?.exito) {
      setRespuestaConfirmacion(cambioRespuesta);
      dispatch(limpiarCambio());
      return;
    }
  }, []);

  const [informacionAgrupada, setInformacionAgrupada] = useState([]);
  

  const clpFormat = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  });

  const descargarBoletos = async () => {
    try {
      if (respuestaConfirmacion != null) {
        const linkSource = `data:application/pdf;base64,${respuestaConfirmacion?.archivo?.archivo}`;
        const downloadLink = document.createElement("a");
        const fileName = respuestaConfirmacion?.archivo?.nombre;
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
      }
    } catch (e) {}
  };

  useEffect(() => {
    dispatch(limpiarListaCarrito());
  }, []);

  return (
    <Layout>
      {respuestaConfirmacion ? (
        <>
          <section className={styles["main-section"]}>
            <div className={styles["images-container"]}>
              <img
                src="/img/ticket-outline.svg"
                alt="ticket"
                className={styles["ticket-image"]}
              />
              <img
                src="/img/checkmark-circle-outline.svg"
                alt="confirmado"
                className={styles["confirmado-image"]}
              />
            </div>
            <h1>¡Hemos confirmado tu viaje!</h1>
            <span className={styles["compra-realizada"]}>
              Tu boleto ha sido confirmado con éxito. <br />
              Dentro de poco te llegará un correo con el boleto para descargar.
            </span>
            <div className={styles["orden-compra"]}>
              <span>
                Código de boleto: {respuestaConfirmacion?.voucher?.boleto}
              </span>
            </div>
            <section className={styles["detalle-viajes"]}>
              <div className={styles["servicio-ida"]}>
                <b className={styles["titulo-servicio"]}>{}</b>
                <div className={styles["detalle-container"]}>
                  <div className={styles["detalle-item"]}>
                    <ul>
                      <li>
                        <div>
                          {respuestaConfirmacion?.voucher?.nombreTerminalOrigen}
                        </div>
                        <div>{}</div>
                      </li>
                      <li>
                        <div>
                          {
                            respuestaConfirmacion?.voucher
                              ?.nombreTerminalDestino
                          }
                        </div>
                        <div>{}</div>
                      </li>
                    </ul>
                    <div className={styles["resumen-servicio"]}>
                      <span>Cantidad de Asientos: {}</span>
                      <b>{1}</b>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className={styles["resumen-pago"]}>
              {props?.carro?.carro?.monto && !props?.carro?.carro?.monto > 0 ? (
                <div className={styles["contenedor-metodo-pago"]}>
                  <strong>Pagado con:</strong>
                  <span>
                    <img
                      src={mediosPago[medioPago]?.imagen}
                      alt={`Icono ${mediosPago[medioPago]?.nombre}`}
                    />
                    <img />
                  </span>
                </div>
              ) : (
                <></>
              )}
              <div className={styles["contenedor-total-pagar"]}>
                <strong>Valor del boleto confirmado:</strong>
                <span>${respuestaConfirmacion?.voucher?.total}</span>
              </div>
            </section>
            <section className={styles["action-container"]}>
              <div className={styles["contenedor-descarga-boletos"]}>
                <img src="/img/icon/general/download-outline.svg" />
                <span onClick={() => descargarBoletos()}>
                  Descarga tus boletos aquí
                </span>
              </div>
              <div className={styles["contenedor-volver-inicio"]}>
                <Link href="/" className={styles["btn"]}>
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
  return {
    props: {
      boleto: context.query || "",
    },
  };
}, sessionOptions);
