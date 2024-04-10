import axios from "axios";
import Layout from "components/Layout";
import Footer from "components/Footer";
import { forwardRef, useEffect } from "react";
import { sessionOptions } from "lib/session";
import getConfig from "next/config";
import Link from "next/link";
import { withIronSessionSsr } from "iron-session/next";
import styles from "./GenerarBoleto.module.css";

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

export default function Home(props) {

  const descargarBoletos = () => {
    if (props.carro) {
      props.carro.boletos.forEach(async (element) => {
        let boleto = {
          codigo: element.codigo,
          boleto: element.boleto,
        };
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
  };

  return (
    <Layout>
      {props.carro ? (
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
            <h1>¡Muchas gracias por tu compra!</h1>
            <span className={styles["compra-realizada"]}>
              Pinche el botón descargar, para obtener sus boletos.
            </span>
            <div className={styles["orden-compra"]}>
              <span>Orden de Compra: {props.codigo}</span>
            </div>

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
              <h2>no se pudo llevar a cabo la descarga de boletos</h2>
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
      publicRuntimeConfig.site_url + "/api/obtener-transaccion",
      context.query
    );
  } catch (error) {}

  return {
    props: {
      codigo: context.query.codigo || "",
      carro: carro.data || null,
    },
  };
}, sessionOptions);
