import axios from "axios";
import Layout from "components/Layout";
import Footer from "components/Footer";
import React, { useEffect, useState } from "react";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import Link from "next/link";
import styles from "./RespuestaTransaccionV2.module.css";
import { useDispatch, useSelector } from "react-redux";
import { format } from "@formkit/tempo";
import { limpiarListaCarrito } from "store/usuario/compra-slice";
import cookie from "cookie";

import { sendGTMEvent } from "@next/third-parties/google";

import JWT from "jsonwebtoken";
import { useRouter } from "next/router";
import Script from "next/script";

const mediosPago: {
  [key: string]: { nombre: string; mensaje: string; imagen: string };
} = {
  WBPAY: {
    nombre: "Webpay",
    mensaje: "Débito RedCompra (WebPay)",
    imagen: "/img/icon/general/webpay.svg",
  },
};

type HomeProps = {
  codigo: string;
  token: string;
  carro: any;
};

const SECRET = "xWL!96JRaWi2lT0jG";

export default function Home(props: HomeProps) {
  const [carro, setCarro] = useState<any>(null);
  const [codigo, setCodigo] = useState<string>("");
  const [carroCompras, setCarroCompras] = useState<any>([]);
  const [passagers, setPassagers] = useState({});

  const router = useRouter();

  useEffect(() => {
    try {
      // const data = sessionStorage.getItem("transactionInformation");
      const data = sessionStorage.getItem("transactionBasketInfo");
      if (data) {
        const decoded: any = JWT.verify(data, SECRET);
        // if (decoded && decoded.carro) {
        if (decoded) {
          // setCarro(decoded.carro);
          setCarro(decoded);
          console.log("carro", decoded);
        }
        if (decoded && decoded.cerrar) {
          setCodigo(decoded.cerrar.orden);
        }
      } else {
        // router.push('/');
      }
    } catch (error) {
      // router.push('/');
    }
  }, []);

  useEffect(() => {
    try {
      const data = sessionStorage.getItem("transactionBasketInfo");
      if (data) {
        const decoded: any = JWT.verify(data, SECRET);
        if (decoded) {
          setCarroCompras(decoded);
          console.log("carroCompras", decoded);
        }
      }
    } catch (error) {}
  }, [carro]);

  const [totalPagar, setTotalPagar] = useState(0);
  const [copiaCarro, setCopiaCarro] = useState({});

  const [resumen, setResumen] = useState<any>({
    carro: {},
  });

  const clpFormat = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  });

  const dispatch = useDispatch();

  const agregarEventoTagManager = () => {
    try {
      if (totalPagar > 0 && carro) {
        sendGTMEvent({
          event: "purchase",
          value: {
            currency: "CLP",
            transaction_id: carro.codigo,
            value: totalPagar,
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const obtenerInformacion = () => {
    let carritoIda: any = {
      titulo: "",
      detalle: [],
    };
    let carritoVuelta: any = {
      titulo: "",
      detalle: [],
    };

    let idaNombre;
    let vueltaNombre;

    Object.keys(carroCompras).forEach((key) => {
      const compra = carroCompras[key];
      console.log("compra", compra);
      if (compra.ida && compra.ida.length > 0) {
        const [year, month, day] = compra.ida[0].date.split("-").map(Number);
        const fechaIda = new Date(year, month - 1, day);
        const idaList = compra.ida;
        console.log(idaList);
        idaList.forEach((value: any) => {
          const datos = {
            origen: `${value.terminalOrigin}`,
            destino: `${value.terminalDestination}`,
            hora: value.departureTime,
            horaLlegada: value.arrivalTime,
            cantidadAsientos: 0,
            total: 0,
            totalFormateado: "",
          };
          value.asientos.forEach((element: any) => {
            datos.cantidadAsientos += 1;
            datos.total += element.valorAsiento;
          });
          idaNombre = `Salida, ${format(fechaIda, "ddd D MMM", "es")}`;
          datos.totalFormateado = clpFormat.format(datos.total);
          carritoIda.detalle.push(datos);
        });
      }

      if (compra.vuelta && compra.vuelta.length > 0) {
        const [year, month, day] = compra.vuelta[0].date.split("-").map(Number);
        const fechaVuelta = new Date(year, month - 1, day);
        const vueltaList = compra.vuelta;
        vueltaList.forEach((value: any) => {
          const datos = {
            origen: `${value.terminalOrigin}`,
            destino: `${value.terminalDestination}`,
            hora: value.departureTime,
            horaLlegada: value.arrivalTime,
            cantidadAsientos: 0,
            total: 0,
            totalFormateado: "",
          };
          value.asientos.forEach((element: any) => {
            datos.cantidadAsientos += 1;
            datos.total += element.valorAsiento;
          });
          datos.totalFormateado = clpFormat.format(datos.total);
          carritoVuelta.detalle.push(datos);
          vueltaNombre = `Vuelta, ${format(fechaVuelta, "ddd D MMM", "es")}`;
        });
      }
    });

    const datos = [];
    carritoIda.titulo = idaNombre;
    carritoVuelta.titulo = vueltaNombre;
    datos.push(carritoIda);
    datos.push(carritoVuelta);
    const carro_temp = { ...resumen };
    carro_temp.carro["lista"] = datos;

    console.log("carro", carro);

    if (carro) {
      // const paymentMethod = carro.medioPago;
      const paymentMethod = "Flow";
      const amount = totalPagar;
      const tickets = carro.asientos;

      const transactionInfo = {
        // transaction: codigo,
        detail: carro_temp,
        paymentMethod: paymentMethod,
        amount,
        tickets,
      };

      setResumen(transactionInfo);

      sessionStorage.setItem("purchase", JSON.stringify(transactionInfo));
      sessionStorage.removeItem("transactionBasketInfo");
      dispatch(limpiarListaCarrito(null));
    }
  };

  const formatGuarani = (value) =>
    new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      currencyDisplay: "symbol",
    })
      .format(value)
      .replace(/Gs\.?|PYG/, "₲");

  // useEffect(() => {
  //   obtenerInformacion();
  // }, [carro]);

  useEffect(() => {
    if (carro && totalPagar > 0) {
      obtenerInformacion();
    }
  }, [carro, totalPagar]);

  useEffect(() => {
    const carro = carroCompras || copiaCarro;
    let total = 0;
    Object.entries(carro).map(([key, value]: any) => {
      const idaList = value.ida || [];
      const vueltaList = value.vuelta || [];

      Object.entries(idaList).map(([key, value]: any) => {
        value.asientos.forEach((element: any) => {
          total += element.valorAsiento;
        });
      });

      Object.entries(vueltaList).map(([key, value]: any) => {
        value.asientos.forEach((element: any) => {
          total += element.valorAsiento;
        });
      });
    });

    setTotalPagar(total);
  }, [carro]);

  // useEffect(() => agregarEventoTagManager(), [totalPagar, codigo, carro]);

  const descargarBoletos = () => {
    carro.boletos.forEach(async (element: any) => {
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
  };

  useEffect(() => {
    getPassagersInfo();

    const carro = carroCompras || copiaCarro;
    let total = 0;
    Object.entries(carro).map(([key, value]: any) => {
      const idaList = value.ida || [];
      const vueltaList = value.vuelta || [];

      Object.entries(idaList).map(([key, value]: any) => {
        value.asientos.forEach((element) => {
          total += element.valorAsiento;
        });
      });

      Object.entries(vueltaList).map(([key, value]: any) => {
        value.asientos.forEach((element) => {
          total += element.valorAsiento;
        });
      });
    });

    setTotalPagar(total);
  }, [resumen]);

  const getPassagersInfo = () => {
    let groupPassagers = {};
    const purchaseInfo = JSON.parse(localStorage.getItem("purchase_info"));
    if (purchaseInfo && purchaseInfo.length > 0) {
      purchaseInfo.forEach((purchase) => {
        purchase.asientos.forEach((seat) => {
          if (!seat.tipoMascota) {
            groupPassagers[seat.rut] = {
              name: seat.nombre,
              lastName: seat.apellido,
              id: seat.rut,
              email: seat.email,
            };
          }
        });
      });
    }
    setPassagers(groupPassagers);
  };

  return (
    <Layout>
      <div className="container my-4">
        {resumen ? (
          <div className="card text-center border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 mt-2">
              <img
                src="/img/ui/transaction/transaction-success.svg"
                alt="confirmado"
              />
            </div>
            <div className="card-body">
              <h1 className="fw-bold text-secondary">
                ¡Muchas gracias por tu compra!
              </h1>
              <div className="container mt-3 mb-2">
                <div className="row justify-content-center">
                  <p className="col-12 col-md-8">
                    Tú compra se ha realizado con éxito. Próximamente, recibirás
                    un correo electronico con los boletos adquiridos.
                  </p>
                </div>
              </div>
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-12 col-md-6">
                    <div className="bg-secondary p-2 rounded-4 shadow-s">
                      <h5 className="text-white fw-bold m-0">
                        Orden de compra: {resumen?.transaction}
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
              {passagers && (
                <div className="mt-3">
                  <b>Datos de los pasajeros:</b>
                  <div className="container mt-3">
                    <div className="row justify-content-center gap-2">
                      {Object.entries(passagers).map(([key, value]: any) => (
                        <div className="col-12 col-md-3 text-center d-flex flex-col">
                          <h5 className="fw-bold">
                            {value.name} {value.lastName}
                          </h5>
                          <span>{value.id}</span>
                          <span>{value.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {resumen?.detail?.carro?.lista && (
                <div className="mt-4 dotted-top dotted-bottom pt-5">
                  <div className="container">
                    <div className="row justify-content-center gap-4">
                      {resumen?.detail?.carro?.lista.map(
                        (lista) =>
                          lista?.titulo && (
                            <div className="col-12 col-md-5">
                              <h6 className="fw-bold">{lista?.titulo}</h6>
                              {lista?.detalle.map((detalle, index) => (
                                <div
                                  key={index}
                                  className={`my-5 ${styles["detalle-item"]}`}
                                >
                                  <ul>
                                    <li>
                                      <div>{detalle.origen}</div>
                                      <div>{detalle.hora}</div>
                                    </li>
                                    <li>
                                      <div>{detalle.destino}</div>
                                      <div>{detalle.horaLlegada}</div>
                                    </li>
                                  </ul>
                                  <div className={styles["resumen-servicio"]}>
                                    <span>
                                      Cantidad de Asientos:{" "}
                                      {detalle.cantidadAsientos}
                                    </span>
                                    <b>{detalle.totalFormateado}</b>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                      )}
                    </div>
                  </div>
                </div>
              )}
              {resumen?.paymentMethod && (
                <div className="container dotted-bottom">
                  <div className="row justify-content-center gap-4 gap-md-2 py-4">
                    <div className="col-12 col-md-5 d-flex flex-col">
                      <strong className="text-start text-md-center">
                        Pagado con:
                      </strong>
                      <div className="d-flex gap-3 justify-content-center">
                        {/* <span className="text-start text-md-center">
                          {mediosPago[resumen.paymentMethod]?.mensaje ||
                            "Pago electrónico"}
                        </span> */}
                        <img
                          // src={
                          //   mediosPago[resumen.paymentMethod]?.imagen ||
                          //   "generico"
                          // }
                          style={{ width: "80px" }}
                          src="/img/icon/cuponera/logo-flow.png"
                          alt={`Icono ${
                            mediosPago[resumen.paymentMethod]?.nombre
                          }`}
                        />
                      </div>
                    </div>
                    <div className="col-12 col-md-5 d-flex flex-row justify-content-center gap-3">
                      <strong className="fs-3">Total Pagado:</strong>
                      <span className="fs-3 text-primary fw-bold">
                        {/* {clpFormat.format(resumen.amount)} */}
                        {formatGuarani(resumen.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="container pb-3 pt-4">
                <div className="row justify-content-evenly gap-5 gap-md-2">
                  <div className="col-12 col-md-5 d-flex justify-content-center align-self-center">
                    <img
                      src="/img/icon/general/download-outline.svg"
                      className="cursor-pointer"
                      onClick={() => descargarBoletos()}
                    />
                    <span
                      className="fw-bold text-decoration-underline cursor-pointer"
                      onClick={() => descargarBoletos()}
                    >
                      Descarga tus boletos aquí
                    </span>
                  </div>
                  <div className="col-12 col-md-5">
                    <Link href="/">
                      <div className="d-grid">
                        <button className="btn btn-primary rounded-4">
                          Volver al inicio
                        </button>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
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
        )}
      </div>
      <Footer />
    </Layout>
  );
}
