import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "components/Layout";
import Footer from "components/Footer";

export default function BoletoOperador() {
  const { query } = useRouter();
  const [boleto, setBoleto] = useState<any>(null);

  useEffect(() => {
    if (query.data) {
      try {
        const decoded = JSON.parse(
          Buffer.from(decodeURIComponent(query.data as string), "base64").toString()
        );
        setBoleto(decoded);
      } catch (err) {
        console.error("Error al decodificar QR:", err);
      }
    }
  }, [query.data]);

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
                    Este boleto ha sido validado correctamente. A continuación se muestran los detalles del viaje.
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
                            <div>Salida: {boleto.date} - {boleto.departureTime}</div>
                          </li>
                          <li>
                            <div>Destino: {boleto.destination}</div>
                            <div>Llegada: {boleto.arrivalDate} - {boleto.arrivalTime}</div>
                          </li>
                        </ul>
                        <div>
                          <span>Asiento: {boleto.seat}</span><br/>
                          <span>Piso: {boleto.floor === 'floor1' ? '1' : '2'}</span><br/>
                          <span>Tipo de asiento: {boleto.tipo}</span><br/>
                          <b>Precio: {boleto.price}</b>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row justify-content-center mb-5">
            <div className="text-center mt-5">
              <h1>Lo sentimos 😢,</h1>
              <h2>No se pudo mostrar el boleto</h2>
            </div>
            <div className="text-center mt-5">
              <h5>Por favor, escanee nuevamente el código QR.</h5>
            </div>
            <div className="mt-5 mb-5 col-lg-2">
              <a className="btn-outline" href="/">
                Salir
              </a>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </Layout>
  );
}