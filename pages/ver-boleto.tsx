import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "components/Layout";
import Footer from "components/Footer";

export default function BoletoOperador() {
  const router = useRouter();
  const [boleto, setBoleto] = useState<any>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const { data } = router.query;
    if (data) {
      try {
        const base64 = data as string;
        const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
        const decoded = JSON.parse(jsonStr);
        setBoleto(decoded);
      } catch (err) {
        console.error("Error al decodificar QR:", err);
      }
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (boleto) {
      console.log("Boleto actualizado:", boleto);
    }
  }, [boleto]);

  const formatGuarani = (value) =>
    new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      currencyDisplay: "symbol",
    })
      .format(value)
      .replace(/Gs\.?|PYG/, "₲");

  if (!boleto) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "40vh" }}
      >
        <div className="spinner-border text-primary mb-3" role="status" />
        <span className="ms-2 text-primary fw-semibold">
          Cargando boleto...
        </span>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container my-4">
        {boleto ? (
          <div className="card text-center border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 mt-2">
              <img
                src="/img/ui/transaction/transaction-success.svg"
                alt="boleto confirmado"
              />
            </div>
            <div className="card-body">
              <h1 className="fw-bold text-secondary">Boleto de viaje</h1>
              <div className="container mt-3 mb-2">
                <div className="row justify-content-center">
                  <p className="col-12 col-md-8">
                    Este boleto ha sido validado correctamente.
                  </p>
                  <p className="col-12 col-md-8">
                    A continuación se muestran los detalles del viaje.
                  </p>
                </div>
              </div>

              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-12 col-md-6">
                    <div className="bg-secondary p-2 rounded-4 shadow-s">
                      <h5 className="text-white fw-bold m-0">
                        Código de boleto: {boleto.authCode}
                      </h5>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 dotted-top dotted-bottom pt-5">
                <div className="container">
                  <div className="row justify-content-center gap-4">
                    <div className="col-12 col-md-5">
                      <h6 className="fw-bold">Detalles del viaje</h6>
                      <div className="my-5">
                        <ul>
                          <li>
                            <div>Origen: {boleto.origin}</div>
                            <div>
                              Salida: {boleto.date} - {boleto.departureTime}
                            </div>
                          </li>
                          <li>
                            <div>Destino: {boleto.destination}</div>
                            <div>
                              Llegada: {boleto.arrivalDate} -{" "}
                              {boleto.arrivalTime}
                            </div>
                          </li>
                        </ul>
                        <div>
                          <span>Asiento: {boleto.seat}</span>
                          <br />
                          <span>
                            Piso: {boleto.floor === "floor1" ? "1" : "2"}
                          </span>
                          <br />
                          <span>Tipo de asiento: {boleto.tipo}</span>
                          <br />
                          <b>Precio: {formatGuarani(boleto.price)}</b>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="container d-flex flex-column justify-content-center align-items-center py-5"
            style={{ minHeight: "75vh" }}
          >
            <div className="text-center mb-2 p-4">
              <h1 className="display-4">Lo sentimos 😢</h1>
              <p className="h5">No se pudo mostrar el boleto</p>
              <p className="text-muted">
                Por favor, escanee el código QR nuevamente.
              </p>
            </div>
            <a href="/" className="btn btn-primary px-4 py-2 mt-3">
              Volver al inicio
            </a>
          </div>
        )}
      </div>
      <Footer />
    </Layout>
  );
}
