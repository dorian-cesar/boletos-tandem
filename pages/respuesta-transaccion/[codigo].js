import axios from "axios";
import Layout from "components/Layout";
import Footer from "components/Footer";
import Image from "next/image";
import { useEffect, useState, forwardRef } from "react";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import getConfig from "next/config";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import Link from "next/link";
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
                  {props.carro.carro.boletos.map((i) => {
                    console.log("datos", i);
                    return (
                      <div className="row mb-5">
                        <div className="row justify-content-center mb-5">
                          <div className="col-8 text-center top">
                            <img src="img/icon-confirmado.svg" alt="" />
                            <h2>
                              <strong>Datos del pasajero</strong>
                            </h2>
                            <p>
                              <strong>{i.pasajero.nombre}</strong>
                            </p>
                            <p>
                              <strong>{i.imprimeVoucher.cliente}</strong>
                            </p>
                            <p>{i.rut}</p>
                          </div>
                        </div>
                        <div className="dotted-line"></div>
                        <div className="row mb-5">
                          <div className="col-6 text-center top">
                            <img src="img/icon-confirmado.svg" alt="" />
                            <h2>
                              <strong>Datos del pasajero</strong>
                            </h2>
                            <p>
                              <strong>{i.pasajero.nombre}</strong>
                            </p>
                            <p>
                              <strong>{i.imprimeVoucher.cliente}</strong>
                            </p>
                            <hr className="my-1"></hr>
                            <p>{i.rut}</p>
                            <hr className="my-1"></hr>
                          </div>
                          <div className="col-6 text-center top">
                            <img src="img/icon-confirmado.svg" alt="" />
                            <h2>
                              <strong>Datos del pasajero</strong>
                            </h2>
                            <p>
                              <strong>{i.pasajero.nombre}</strong>
                            </p>
                            <p>
                              <strong>{i.imprimeVoucher.cliente}</strong>
                            </p>
                            <hr className="my-1"></hr>
                            <p>{i.rut}</p>
                            <hr className="my-1"></hr>
                          </div>
                        </div>
                        <div className="dotted-line"></div>
                        <div className="row mb-1">
                          <div className="col-6 text-center top">
                            <p>
                              <strong>
                                {props.carro.carro.boletos.length}X boleto Semi
                                Cama
                              </strong>
                            </p>
                            <h3>Total Pagado</h3>
                            <p>
                              {props.carro.carro.tipoPago == "VD"
                                ? "DEBITO"
                                : "CREDITO"}
                            </p>
                          </div>
                          <div className="col-6 text-center top">
                            <h4>${props.carro.carro.montoFormateado}</h4>
                          </div>
                        </div>
                        <div className="row mb-1">
                          <div className="col-6 text-center top"></div>
                          <div className="col-6 text-center top">
                            <a href="/" className="btn">
                              Ir al inicio
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
