import axios from "axios";
import Layout from "components/Layout";
import Footer from "components/Footer";
import { forwardRef } from "react";
import { sessionOptions } from "lib/session";
import getConfig from "next/config";
import Link from "next/link";
import { withIronSessionSsr } from 'iron-session/next'
import styles from "./RespuestaTransaccionConfirmacion.module.css"
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";


const { publicRuntimeConfig } = getConfig();


export default function Home(props) {

  const [cuponeraData, setCuponeraData] = useState(null);

  const informacionAgrupada =
    useSelector((state) => state.compra?.informacionAgrupada) || [];

  /* 
  se debe arreglar vista
  se debe crear un metodo para volver al inicio y limpiar el carrito */
  

  return (
    <Layout>
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
                      ¡Hemos confirmado tu viaje!
                    </h2>
                    <p className={styles["sub-title"]}>
                      Tu boleto ha sido confirmado con éxito. <br />
                      Dentro de poco te llegará un correo con el boleto para descargar.
                    </p>
                  </div>
                </div>
              </div>
              <div className={"col-12"}>
                <div className={"row justify-content-center"}>
                  <div className={"col-6 text-center"}>
                    <p className={styles["orden"]}>
                      Código de boleto:{" "}
                      {props.boleto.codigo}
                    </p>
                  </div>
                </div>
              </div>
              <div className={"col-12"}>
                <div className={"row justify-content-center"}>
                  <div className={"col-6 text-center"}>
                    <p className={styles["data-passenger"]}>
                      Datos del pasajero
                    </p>
                    <p className={styles["name"]}>
                      {informacionAgrupada[0]?.asientos[0]?.nombre}
                    </p>
                    <p className={styles["id"]}>
                      {informacionAgrupada[0]?.asientos[0]?.rut}
                    </p>
                    <p className={styles["id"]}>
                      {informacionAgrupada[0]?.asientos[0]?.email}
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
                        
                      </p>
                      <p className={styles["id"]}>
                      {informacionAgrupada[0]?.fechaServicio } 
                      </p>
                      <p className={styles["id"]}>
                        &#8226; {informacionAgrupada[0]?.terminalOrigen } - { informacionAgrupada[0]?.horaSalida}
                      </p>
                      <p className={styles["id"]}>
                        &#8226; {informacionAgrupada[0]?.terminalDestino } - { informacionAgrupada[0]?.horaLlegada}
                      </p>
                      <div className={"row justify-content-center"}>
                        <div className={styles["dotted-line"]}></div>
                        <p className={styles["id"]}>
                          Valor Total:{" "}
                          <span className={styles["price"]}>
                            {" "}
                            ${informacionAgrupada[0]?.asientos[0]?.tarifa }
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
                  <p className={styles["data-passenger"]}>Valor boleto:</p>
                  </div>
                  <div className={"col-3"}>
                  <p className={styles["price-final"]}> ${informacionAgrupada[0]?.asientos[0]?.tarifa}</p>
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
