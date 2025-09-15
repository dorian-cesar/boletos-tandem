"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Footer from "components/Footer";
import Layout from "components/Layout";

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos enviados:", formData);
    // Aquí conectas con tu API (Nodemailer, backend, etc.)
  };

  const router = useRouter();

  return (
    <Layout>
      <div className="mb-4">
        <img
          src="/img/icon/contacto/contact-banner.webp"
          alt="Montañas con nieve"
          className="img-fluid w-100"
          style={{ maxHeight: "280px", objectFit: "cover" }}
        />
      </div>
      <div className="container py-5 mb-4">
        <div className="row g-5 align-items-center">
          {/* Columna izquierda */}
          <div className="col-md-5 mt-2">
            <h2 className="mb-3">¿Necesitas ayuda?</h2>
            <p className="text-muted mb-4">
              Completa el formulario y nuestro equipo se pondrá en contacto
              contigo lo antes posible.
            </p>

            {/* Soporte 24/7 */}
            <div className="d-flex align-items-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="none"
                stroke="#5dade2"
                strokeWidth="1.5"
                className="me-2"
                viewBox="0 0 16 16"
              >
                <path d="M8 1a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a6 6 0 1 1 12 0v6a2.5 2.5 0 0 1-2.5 2.5H9.366a1 1 0 0 1-.866.5h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 .866.5H11.5A1.5 1.5 0 0 0 13 12h-1a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1V6a5 5 0 0 0-5-5" />
              </svg>
              <span className="text-muted">Soporte 24/7</span>
            </div>

            {/* Call center debajo */}
            <div className="d-flex align-items-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="none"
                stroke="#5dade2"
                strokeWidth="1.5"
                className="me-2"
                viewBox="0 0 16 16"
              >
                <path d="M3.654 1.328a.678.678 0 0 1 1.015-.063l2.29 2.29a.678.678 0 0 1-.063 1.015l-1.01.757a.678.678 0 0 0-.215.87c.261.52.738 1.39 1.502 2.154.764.764 1.634 1.241 2.154 1.502a.678.678 0 0 0 .87-.215l.757-1.01a.678.678 0 0 1 1.015-.063l2.29 2.29a.678.678 0 0 1-.063 1.015l-1.497 1.12a1.745 1.745 0 0 1-1.744.415c-2.85-.95-5.822-3.921-6.772-6.772a1.745 1.745 0 0 1 .415-1.744L3.654 1.328z" />
              </svg>
              <span className="text-muted">Call center: +56 2 3304 8632</span>
            </div>

            {/* Email */}
            <div className="d-flex align-items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="none"
                stroke="#5dade2"
                strokeWidth="1.5"
                className="me-2"
                viewBox="0 0 16 16"
              >
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v0.217l-8 4.8-8-4.8V4zm0 1.383v6.634L5.803 8.5 0 5.383zM6.761 9.36l-6.761 4.056A2 2 0 0 0 2 15h12a2 2 0 0 0 2-1.584l-6.761-4.056L8 10.917l-1.239-1.556z" />
              </svg>
              <span className="text-muted">
                soporte_centinela@tandemindustrial.cl
              </span>
            </div>
          </div>
          {/* Columna derecha (formulario) */}
          <div className="col-md-7 mt-4">
            <div className="card shadow-sm border-0 p-4">
              <h4 className="mb-4">Formulario de Contacto</h4>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nombre"
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Correo electrónico"
                    required
                  />
                </div>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Mensaje"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Enviar
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 mt-2"
                  onClick={() => router.back()}
                >
                  Volver
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
