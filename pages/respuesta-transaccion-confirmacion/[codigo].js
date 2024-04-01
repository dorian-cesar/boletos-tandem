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

import { limpiarListaCarrito } from "store/usuario/compra-slice";

const { publicRuntimeConfig } = getConfig();

export default function Home(props) {
  const informacionAgrupadaSlice = useSelector((state) => state.compra?.informacionAgrupada) || [];

  const [informacionAgrupada, setInformacionAgrupada] = useState([]);
  const dispatch = useDispatch();

  const clpFormat = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  });

  useEffect(() => {
    if( informacionAgrupadaSlice.length > 0 ) {
      setInformacionAgrupada(informacionAgrupadaSlice);
    }
  }, [informacionAgrupadaSlice])
  
  useEffect(() => {
    if( informacionAgrupada.length > 0) {
      dispatch(limpiarListaCarrito());
    }
  }, [informacionAgrupada])

  const descargarBoletos = async () =>{
    try {
    const res = await axios.post("/api/voucher", props.boleto.codigo);
    if (res.request.status) {
        const linkSource = `data:application/pdf;base64,${res.data?.archivo}`;
        const downloadLink = document.createElement("a");
        const fileName = res.data.nombre;
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }
  } catch (e) {}
  }

  return (
    <Layout>
      { informacionAgrupadaSlice && informacionAgrupadaSlice.length > 0 || informacionAgrupada? 
        (<div className={styles["home"]}>
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
                            { clpFormat.format(informacionAgrupada[0]?.asientos[0]?.tarifa) }
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
                  </div>
                  <div className={"col-3"}>
                  <p className={styles["data-passenger"]}>Valor boleto:</p>
                  </div>
                  <div className={"col-3"}>
                  <p className={styles["price-final"]}>{ clpFormat.format(informacionAgrupada[0]?.asientos[0]?.tarifa) }</p>
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

                    {/* TODO: COPIAR DESDE CAMBIO DE BOLETO */}
                    {/* <a className={styles["pay-for"]}> <img
                      className={styles["image-download"]}
                      src="/img/icon/coupon-response/download-outline.svg"
                      alt=""
                    />
                      <span onClick={()=> descargarBoletos()}>
                        Descarga tus boletos aquí
                      </span>
                    </a> */}
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
        </div>)
        : 
        (<>
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
