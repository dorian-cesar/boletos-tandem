import Footer from "components/Footer";
import Layout from "components/Layout";
import cookie from "cookie";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ErrorTransaccion() {
  const [transactionCodeStr, setTransactionCodeStr] = useState<string>("");

  useEffect(() => {
    try {
      const cookies = cookie.parse(document.cookie || "");
      const code = cookies.transactionCode || "";
      setTransactionCodeStr(code);
    } catch (error) {
      console.error("Error parsing cookie:", error);
    }
  }, []);

  return (
    <Layout>
      <div
        className="container d-flex flex-column justify-content-center align-items-center py-5"
        style={{ minHeight: "75vh" }}
      >
        <div className="text-center mb-2 p-4">
          <h1 className="display-4">Lo sentimos 😢</h1>
          <p className="h5">
            No se pudo completar la transacción de tu compra.
          </p>
          <p className="text-muted">Por favor, inténtalo nuevamente.</p>
        </div>

        {transactionCodeStr && (
          <div
            className="alert alert-secondary text-center w-100 w-md-50"
            role="alert"
          >
            <strong>Código de transacción:</strong> {transactionCodeStr}
          </div>
        )}

        <Link href="/" className="btn btn-primary px-4 py-2 mt-3">
          Volver al inicio
        </Link>
      </div>

      <Footer />
    </Layout>
  );
}
