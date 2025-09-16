"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Footer from "components/Footer";
import Layout from "components/Layout";
import { FiClock, FiPhone, FiMail } from "react-icons/fi";

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
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
          style={{ maxHeight: "230px", objectFit: "cover" }}
        />
      </div>
      <div className="container pt-2 pt-md-5 mb-4">
        <div className="row g-0 g-md-5 align-items-center">
          {/* Columna izquierda */}
          <div className="col-md-5 mt-2">
            <h2
              className="mb-3"
              style={{ color: "#2c68de", fontWeight: "bold" }}
            >
              ¿Necesitas ayuda?
            </h2>
            <p className="text-muted mb-4">
              Completa el formulario y nuestro equipo se pondrá en contacto
              contigo lo antes posible.
            </p>

            {/* Soporte 24/7 */}
            <div className="d-flex align-items-center mb-3">
              <FiClock size={22} color="#5dade2" className="me-2" />
              <span className="text-muted">Soporte 24/7</span>
            </div>

            {/* Call center debajo */}
            <div className="d-flex align-items-center mb-3">
              <FiPhone size={22} color="#5dade2" className="me-2" />
              <span className="text-muted">Call center: +56 2 3304 8632</span>
            </div>

            {/* Email */}
            <div className="d-flex align-items-center mb-3">
              <FiMail size={22} color="#5dade2" className="me-2" />
              <span className="text-muted">
                soporte_centinela@tandemindustrial.cl
              </span>
            </div>
          </div>

          {/* Columna derecha (formulario) */}
          <div className="col-md-7 mt-4">
            <div className="card shadow-sm border-0 p-4 rounded-4">
              <h4
                className="mb-4"
                style={{ color: "#2860cf", fontWeight: "bold" }}
              >
                Formulario de Contacto
              </h4>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nombre y apellido"
                    required
                  />
                </div>

                {/* Fila con Email y Teléfono */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ejemplo@correo.com"
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="phone" className="form-label">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+56 9 1234 5678"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="message" className="form-label">
                    Mensaje
                  </label>
                  <textarea
                    className="form-control"
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Escribe tu mensaje..."
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
