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
import { useDispatch, useSelector } from "react-redux";
import { limpiarCuponera } from "store/usuario/compra-cuponera-slice";

const { publicRuntimeConfig } = getConfig();

export default function Home(props) {
  const dispatch = useDispatch();
  const informacionCompra = useSelector((state) => state.compraCuponera) || {};
  const [cuponeraData, setCuponeraData] = useState(null);
  const [datosCompra, setDatosCompra] = useState({
    carroCuponera: {
      cantidadCupones: 0,
      codigoCuponera: "",
      cuponesExtras: 0,
      destino: "",
      destinoDescripcion: "",
      dias: "0000000",
      diasDuracion: 0,
      empresa: "",
      estado: "",
      estadoNominativa: false,
      estadoVentanilla: false,
      estadoWeb: false,
      horaDesde: "0000",
      horaHasta: "0000",
      nombreCuponera: "",
      origen: "",
      origenDescripcion: "",
      valorCupon: 0,
      valorTotalCuponera: 0,
  },
  });
  const [medioPago, setMedioPago] = useState("WBPAY");
  const mediosPago = {
    WBPAY: {
      nombre: "Webpay",
      mensaje: "Débito RedCompra (WebPay)",
      imagen: "/img/icon/general/webpay.svg",
    },
  };

  async function obtenerCuponera() {
    try {
      const response = await axios.post(
        publicRuntimeConfig.site_url + "/api/coupon/obtener-cuponera",
        props.codigo
      );
      setCuponeraData(response.data);
    } catch (error) {}
  }

  const clpFormat = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  });


  useEffect(() => {
    if(informacionCompra){
      setDatosCompra(informacionCompra)
      dispatch(limpiarCuponera());
    }
   
  },[]);

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

  function interpretarSecuenciaDias(secuencia) {
    const diasSemana = [
      "Lunes ",
      "Martes ",
      "Miércoles ",
      "Jueves ",
      "Viernes ",
      "Sábado ",
      "Domingo ",
    ];
    let diasActivos = [];
    for (let i = 0; i < secuencia.length; i++) {
      if (secuencia[i] === "1") {
        diasActivos.push(diasSemana[i]);
      }
    }
    return diasActivos;
  }

  function formatearHora(cadenaHora) {
    if (cadenaHora.length !== 4) {
      throw new Error("La cadena de hora debe tener cuatro dígitos.");
    }
    const hora = cadenaHora.slice(0, 2);
    const minutos = cadenaHora.slice(2);
    return `${hora}:${minutos}`;
  }

  return (
    <Layout>
      {props.carro ? (
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
            Tu compra se ha realizado con éxito. Dentro de poco te llegará un
            correo con el código de uso para la cuponera.
          </span>
          <div className={styles["orden-compra"]}>
            Orden de compra: {props?.codigo}
          </div>
          <p className={styles["data-cuponera"]}>
            <strong>Código cuponera:</strong>{" "}
            {cuponeraData?.response?.codigoSeguridad}
          </p>
          <div
            className={`row justify-content-center mt-2 ${styles["contenedor-codigo-seguridad"]}`}
          >
            <div className={"col-9 text-center"}>
              <img
                src={`https://barcode.tec-it.com/barcode.ashx?data=${cuponeraData?.response?.codigoSeguridad}&code=MobileQRCode&eclevel=L`}
                className="my-4"
                width="162"
                height="162"
              />
              <p className={styles["codigo-seguridad"]}>
                Código cuponera: {cuponeraData?.response?.codigoSeguridad}
              </p>
            </div>
          </div>
          <section className={styles["detalle-viajes"]}>
            <div className={styles["servicio-ida"]}>
              <b className={styles["titulo-servicio"]}>{}</b>
              <div className={styles["detalle-container"]}>
                <div className={styles["detalle-item"]}>
                  <ul>
                    <li>
                      <div>
                        {datosCompra?.carroCuponera?.origenDescripcion}
                      </div>
                      <div>{}</div>
                    </li>
                    <li>
                      <div>
                        {datosCompra?.carroCuponera?.destinoDescripcion}
                      </div>
                      <div>{}</div>
                    </li>
                  </ul>
                  <div className={styles["resumen-servicio"]}>
                    <span>Cantidad cupones: {}</span>
                    <b>
                      {cuponeraData?.response?.datosCuponera?.cupones +
                        cuponeraData?.response?.datosCuponera?.cuponesExtra}
                    </b>
                  </div>
                  <div className={styles["resumen-servicio-detalle"]}>
                    <span>Días de uso: </span>
                    <b>
                      {interpretarSecuenciaDias(
                        datosCompra?.carroCuponera?.dias
                      )}
                    </b>
                  </div>
                  <div className={styles["resumen-servicio-detalle"]}>
                    <span>Horario de uso: </span>
                    <b>
                      {formatearHora(
                        datosCompra?.carroCuponera?.horaDesde
                      )}{" "}
                      a{" "}
                      {formatearHora(
                        datosCompra?.carroCuponera?.horaHasta
                      )}{" "}
                      hrs
                    </b>
                  </div>
                  <div className={styles["resumen-servicio-detalle"]}>
                    <span>Duración cuponera: </span>
                    <b>{datosCompra?.carroCuponera?.diasDuracion} Días</b>
                  </div>
                  <div className={styles["resumen-servicio-detalle"]}>
                    <span>Nominativa al comprador: </span>
                   {(datosCompra?.carroCuponera?.estadoNominativa) ? <b>Si</b> : <b>No</b>} 
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className={styles["resumen-pago"]}>
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

            <div className={styles["contenedor-total-pagar"]}>
              <strong>Total Pagado:</strong>
              <span>
                {clpFormat.format(
                  cuponeraData?.response?.encabezado?.totalVenta
                )}{" "}
              </span>
            </div>
          </section>
          <section className={styles["action-container"]}>
            <div className={styles["contenedor-descarga-boletos"]}>
              <a className={styles["pay-for"]} onClick={() => window.print()}>
                {" "}
                <img
                  className={styles["image-download"]}
                  src="/img/icon/coupon-response/download-outline.svg"
                  alt=""
                />{" "}
                Descarga tu cuponera aquí
              </a>
            </div>
            <div className={styles["contenedor-volver-inicio"]}>
              <Link href="/" className={styles["btn"]}>
                Volver al inicio
              </Link>
            </div>
          </section>
        </section>
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
