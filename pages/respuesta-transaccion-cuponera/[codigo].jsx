import axios from "axios";
import Layout from "components/Layout";
import Footer from "components/Footer";
import { forwardRef } from "react";
import { sessionOptions } from "lib/session";
import getConfig from "next/config";
import Link from "next/link";
import { withIronSessionSsr } from "iron-session/next";
import { useEffect, useState } from "react";
import styles from "./RespuestaTransaccionCuponera.module.css";

const { publicRuntimeConfig } = getConfig();

export default function Home(props) {
  const [cuponeraData, setCuponeraData] = useState(null);

  async function obtenerCuponera() {
    try {
      const response = await axios.post(
        publicRuntimeConfig.site_url + "/api/coupon/obtener-cuponera",
        props.codigo
      );
      setCuponeraData(response.data);
    } catch (error) {}
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (props != null) {
          await obtenerCuponera();
        }
      } catch (error) {
        console.error("Error fetching cuponera:", error);
      }
    };

    fetchData();
  }, [props.cuponera, props.codigo]);
  return (
    <Layout>
      {props.carro ? (
        <div className={styles["home"]}>
          <div className={styles["container"]}>
            <div className={"row justify-content-center"}>
              <div className={"col-12"}>
                <div className={"row justify-content-center"}>
                  <div className={"col-6 text-center"}>
                    <img
                      className={styles["image"]}
                      src="/img/icon/coupon-response/ticket-outline.svg"
                      alt=""
                    />
                    <img
                      className={styles["image-check"]}
                      src="/img/icon/coupon-response/checkmark-circle-outline.svg"
                      alt=""
                    />
                  </div>
                </div>
              </div>
              <div className={"col-12"}>
                <div className={"row justify-content-center"}>
                  <div className={"col-6 text-center"}>
                    <h2 className={styles["title"]}>
                      ¡Muchas gracias por tu compra!
                    </h2>
                    <p className={styles["sub-title"]}>
                      Tu compra se ha realizado con éxito. <br />
                      Dentro de poco te llegará un correo con el código de uso
                      para la cuponera.
                    </p>
                  </div>
                </div>
              </div>
              <div className={"col-12"}>
                <div className={"row justify-content-center"}>
                  <div className={"col-6 text-center"}>
                    <p className={styles["orden"]}>
                      Orden de compra:{" "}
                      {cuponeraData?.response?.encabezado?.codigo}
                    </p>
                  </div>
                </div>
              </div>
              <div className={"col-12"}>
                <div className={"row justify-content-center"}>
                  <div className={"col-6 text-center"}>
                    <p className={styles["data-passenger"]}>
                      Datos del comprador
                    </p>
                    <p className={styles["name"]}>
                      {cuponeraData?.response?.encabezado?.nombre}{" "}
                      {cuponeraData?.response?.encabezado?.apellido}
                    </p>
                    <p className={styles["id"]}>
                      {cuponeraData?.response?.encabezado?.rut}
                    </p>
                    <p className={styles["id"]}>
                      {cuponeraData?.response?.encabezado?.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className={"col-12"}>
                <div className={"row justify-content-center mb-4"}>
                  <div className={styles["dotted"]}></div>
                </div>
              </div>
              <div className={"col-12"}>
                <div className={"row justify-content-center"}>
                  <div className={"col-4"}>
                    <div className={styles["container-cuponera"]}>
                      <p className={styles["data-passenger"]}>
                        {cuponeraData?.response?.datosCuponera?.nombre}
                      </p>
                      <p className={styles["id"]}>
                        Duración:
                        {
                          cuponeraData?.response?.datosCuponera?.diasDuracion
                        }{" "}
                        días para uso a partir del día de compra
                      </p>
                      <p className={styles["id"]}>
                        &#8226; {cuponeraData?.response?.datosCuponera?.cupones}{" "}
                        Cupones
                      </p>
                      <p className={styles["id"]}>
                        &#8226;{" "}
                        {cuponeraData?.response?.datosCuponera?.cuponesExtra ===
                        0
                          ? cuponeraData?.response?.datosCuponera
                              ?.cuponesExtra + " Cupón extra"
                          : cuponeraData?.response?.datosCuponera
                              ?.cuponesExtra + " Cupones extras"}
                      </p>
                      <div className={"row justify-content-center"}>
                        <div className={styles["dotted-line"]}></div>
                        <p className={styles["id"]}>
                          Valor Total:{" "}
                          <span className={styles["price"]}>
                            {" "}
                            ${cuponeraData?.response?.encabezado?.totalVenta}
                          </span>
                        </p>
                        <div className={styles["dotted-line"]}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={"col-12"}>
                <div className={"row justify-content-center mb-3"}>
                  <div className={styles["dotted"]}></div>
                </div>
              </div>
              <div className={"col-12"}>
                <div className={"row justify-content-center"}>
                  <div className={"col-6"}>
                    <p className={styles["pay-for"]}>Pagado con:</p>
                    <p className={styles["detail-pay"]}> Débito RedCompra (WebPay)  <img
                      className={styles["image"]}
                      src="/img/icon/coupon-response/wbpay.svg"
                      alt=""
                    />  </p>  
                  </div>
                  <div className={"col-3"}>
                  <p className={styles["data-passenger"]}>Total Pagado:</p>
                  </div>
                  <div className={"col-3"}>
                  <p className={styles["price-final"]}> ${cuponeraData?.response?.encabezado?.totalVenta}</p>
                  </div>
                </div>
              </div>
              <div className={"col-12"}>
                <div className={"row justify-content-center mb-5"}>
                  <div className={styles["dotted"]}></div>
                </div>
              </div>
              <div className={"col-12"}>
                <div className={"row justify-content-center mb-4"}>
                  <div className={"col-6 text-center"}>

                   
                    {/* <a className={styles["pay-for"]}> <img
                      className={styles["image-download"]}
                      src="/img/icon/coupon-response/download-outline.svg"
                      alt=""
                    /> Descarga tu cuponera aquí</a> */}
                  </div>
                  <div className={"col-6 text-center"}>

                  <a href="/" className={styles["button-home"]}>
                      Volver al inicio
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
  let cuponera = {};

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
      cuponera: cuponera?.response || null,
    },
  };
}, sessionOptions);
