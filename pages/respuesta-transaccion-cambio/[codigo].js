import axios from "axios";
import Layout from "components/Layout";
import Footer from "components/Footer";
import { forwardRef } from "react";
import { sessionOptions } from "lib/session";
import getConfig from "next/config";
import Link from "next/link";
import { withIronSessionSsr } from "iron-session/next";
import styles from "./RespuestaTransaccionCambio.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { format } from "@formkit/tempo";
import { limpiarListaCarrito } from "store/usuario/compra-slice";
import { decryptData } from 'utils/encrypt-data';

const { publicRuntimeConfig } = getConfig();

export default function Home(props) {

  const { carro } = props;

  const [respuestaCambio, setRespuestaCambio] = useState({
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

  useEffect(() => {
    const cambiarBoleto = decryptData('CHN_TKT');
    if( carro.cerrar.estado && carro.commit.status === 'AUTHORIZED' && cambiarBoleto) {
      axios.post(
        "/api/ticket_sale/cambiar-boleto",
        cambiarBoleto
      ).then(response => {
        setRespuestaCambio(response.data?.object);
        localStorage.removeItem('CHN_TKT');
      })
      .catch(error => console.error('ERROR AL CAMBIAR BOLETO:', error));
    }
  }, []);

  const dispatch = useDispatch();
  const [medioPago, setMedioPago] = useState("WBPAY");
  const mediosPago = {
    WBPAY: {
      nombre: "Webpay",
      mensaje: "Débito RedCompra (WebPay)",
      imagen: "/img/icon/general/webpay.svg",
    },
  };

  const clpFormat = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  });

  const descargarBoletos = async () => {
    try {
      if (respuestaCambio != null) {
        const linkSource = `data:application/pdf;base64,${respuestaCambio?.archivo?.archivo}`;
        const downloadLink = document.createElement("a");
        const fileName = respuestaCambio?.archivo?.nombre;
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
      {respuestaCambio ? (
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
            <h1>¡Hemos cambiado tu viaje!</h1>
            <span className={styles["compra-realizada"]}>
              Tu boleto ha sido cambiado con éxito. Próximamente, recibirás un
              correo electrónico con los boletos adquiridos.
            </span>
            <div className={styles["orden-compra"]}>
              <span>Orden de compra: {props?.codigo}</span>
            </div>
            <section className={styles["detalle-viajes"]}>
              <div className={styles["servicio-ida"]}>
                <b className={styles["titulo-servicio"]}>{}</b>
                <div className={styles["detalle-container"]}>
                  <div className={styles["detalle-item"]}>
                    <ul>
                      <li>
                        <div>
                          {respuestaCambio?.voucher?.nombreTerminalOrigen}
                        </div>
                        <div>{}</div>
                      </li>
                      <li>
                        <div>
                          {respuestaCambio?.voucher?.nombreTerminalDestino}
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
              {
                (props?.carro?.carro?.monto && !props?.carro?.carro?.monto > 0) ? (
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
                ) : <></>
              }
              <div className={styles["contenedor-total-pagar"]}>
                <strong>Total Pagado:</strong>
                {(!props?.carro?.carro?.monto) ? <span>{clpFormat.format(0)}</span> : <span>{clpFormat.format(props?.carro?.carro?.monto)}</span>} 
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
  let carro = {};

  try {
    carro = await axios.post(
      publicRuntimeConfig.site_url + "/api/carro-cambio",
      context.query
    );
    Object.assign(carro, { statusTransaccion: true });
    console.log("datos", carro);
  } catch (error) {}

  return {
    props: {
      codigo: context.query.codigo || "",
      token: context.query.token_ws || "",
      carro: carro.data || null,
    },
  };
}, sessionOptions);
