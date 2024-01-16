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
  return (
    <Layout>
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
      <Footer />
    </Layout>
  );
}

export const getServerSideProps = withIronSessionSsr(async function (context) {

  return {
    props: {
      codigo: context.query.codigo || "",
      token: context.query.token_ws || "",
      carro: carro.data || null,
    },
  };
}, sessionOptions);
