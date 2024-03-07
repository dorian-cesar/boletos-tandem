import axios from "axios";
import Layout from "components/Layout";
import Footer from "components/Footer";
import { forwardRef } from "react";
import { sessionOptions } from "lib/session";
import getConfig from "next/config";
import Link from "next/link";
import { withIronSessionSsr } from 'iron-session/next'
import styles from "./RespuestaTransaccionCambio.module.css"
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { format } from "@formkit/tempo"


const { publicRuntimeConfig } = getConfig();


export default function Home(props) {

  
const mediosPago = {
  WBPAY: {
    nombre: "Webpay",
    mensaje: 'Débito RedCompra (WebPay)',
    imagen: "/img/icon/general/webpay.svg",
  }
}

  const clpFormat = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  });


  const informacionAgrupada =
    useSelector((state) => state.compra?.informacionAgrupada) || [];

  const respuestaCambio = useSelector((state) => state.cambioBoleto || {} );
  const medioPago = useSelector((state) => state.compra?.medioPago) || '';
  
  const descargarBoletos = async () =>{
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
    
  }

  return (
    <Layout>
        <section className={ styles['main-section'] }>
            <div className={ styles['images-container'] }>
              <img src="/img/ticket-outline.svg" alt="ticket" className={ styles['ticket-image'] } />
              <img src="/img/checkmark-circle-outline.svg" alt="confirmado" className={ styles['confirmado-image'] } />
            </div>
            <h1>¡Hemos cambiado tu viaje!</h1>
            <span className={ styles['compra-realizada'] }>Tu boleto ha sido cambiado con éxito. Próximamente, recibirás un correo electrónico con los boletos adquiridos.</span>
            <div className={ styles['orden-compra'] }>
              <span>Orden de compra: {props.boleto.codigo}</span>
            </div>
            <section className={ styles['detalle-viajes'] }>
                  <div className={styles["servicio-ida"]} >
                    <b className={ styles['titulo-servicio'] }>{  }</b>
                    <div className={styles["detalle-container"]}>
              
                          <div className={styles["detalle-item"]}>
                            <ul>
                              <li>
                                <div>{respuestaCambio?.voucher?.nombreTerminalOrigen}</div>
                                <div>{ }</div>
                              </li>
                              <li>
                                <div>{ respuestaCambio?.voucher?.nombreTerminalDestino }</div>
                                <div>{ }</div>
                              </li>
                            </ul>
                            <div className={ styles['resumen-servicio'] }>
                              <span>Cantidad de Asientos: {}</span>
                              <b>{ 1 }</b>
                            </div>
                          </div>
                    
                    </div>
                  </div>
            </section>
            <section className={ styles['resumen-pago'] }>
              <div className={ styles['contenedor-metodo-pago'] }>
                <strong>Pagado con:</strong>
                <span>
                  <img src={ mediosPago[medioPago]?.imagen } alt={ `Icono ${mediosPago[medioPago]?.nombre}` }/>
                  <img />
                </span>
              </div>
              <div className={ styles['contenedor-total-pagar'] }>
                <strong>Total Pagado:</strong>
                <span>${ respuestaCambio?.voucher?.total }</span>
              </div>
            </section>
            <section className={ styles['action-container'] }>
              <div className={ styles['contenedor-descarga-boletos']}>
                <img src='/img/icon/general/download-outline.svg' />
                <span onClick={()=> descargarBoletos()}>
                  Descarga tus boletos aquí
                </span>
              </div>
              <div className={ styles['contenedor-volver-inicio'] }>
                <Link href="/" className={ styles['btn'] }>
                  Volver al inicio
                </Link>
              </div>
            </section>
          </section>
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
