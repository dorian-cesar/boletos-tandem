import axios from "axios";
import Layout from "components/Layout";
import Footer from "components/Footer";
import { forwardRef } from "react";
import { sessionOptions } from "lib/session";
import getConfig from "next/config";
import Link from "next/link";
import { withIronSessionSsr } from 'iron-session/next'

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
  console.log("PROPS::::", props);
  return (
    <Layout>
      {props.carro ? (
        <div className="confirmacion py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-10">
                <div className="row justify-content-center mb-5">
                  <div className="col-8 text-center top">
                    <img src="img/icon-confirmado.svg" alt="" />
                    <h2>¡Muchas gracias por tu compra!</h2>
                    <p>
                      Tu compra se ha realizado con éxito. <br />
                      Dentro de poco te llegará un mail con la facturación del
                      pasaje.
                    </p>
                  </div>
                </div>
                <div className="block-top">
                  <div className="row">
                    <div className="col-12">
                      <h2>Orden de compra: {props.codigo}</h2>
                    </div>
                  </div>
                </div>
                <div className="block">
                 <h1>usted compro una cuponera!!!!</h1>
                  <div className="row mb-5"></div>
                </div>
                <div className="row mt-5">
                  <div className="col-12 col-md-8 mb-3 mb-md-0"></div>
                  <div className="col-12 col-md-4">
                    <a href="/" className="btn">
                      Ir al inicio
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      publicRuntimeConfig.site_url + "/api/coupon/carro",
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
