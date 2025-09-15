"use client";

import { useState } from "react";
import { useForm } from "/hooks/useForm";
import axios from "axios";
import styles from "./AnularCompra.module.css";

const anularFormFields = {
  numeroReserva: "",
  email: "",
};

const AnularPasajeForm = () => {
  const { formState, onInputChange, resetForm } = useForm(anularFormFields);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formState.numeroReserva || !formState.email) {
      setErrorMessage("Por favor completa ambos campos.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.post("/api/anular-pasaje", formState);

      if (response.status === 200) {
        setSuccessMessage("Tu pasaje ha sido anulado correctamente.");
        resetForm();
      } else {
        setErrorMessage("No se pudo anular el pasaje. Verifica tus datos.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Ocurrió un error al procesar tu solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles["menu-central"]}>
      <h1 className="title-historial">Anular Pasaje</h1>
      <span>
        Ingresa tu número de reserva y tu email para anular tu pasaje.
      </span>

      <form
        className={styles["table-responsive-custom"]}
        onSubmit={handleSubmit}
        style={{
          marginTop: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div className={styles["form-group"]}>
          <label htmlFor="numeroReserva">Número de Reserva</label>
          <input
            type="text"
            id="numeroReserva"
            name="numeroReserva"
            value={formState.numeroReserva}
            onChange={onInputChange}
            placeholder="Ej: ABC123"
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
        </div>

        <div className={styles["form-group"]}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formState.email}
            onChange={onInputChange}
            placeholder="tu@email.com"
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
        </div>

        {errorMessage && (
          <p
            className={styles["error-message"]}
            style={{ color: "#ff0000", fontWeight: 500 }}
          >
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p
            className={styles["success-message"]}
            style={{ color: "#3365b4", fontWeight: 500 }}
          >
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          className={styles["popup-button"]}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Procesando..." : "Anular Pasaje"}
        </button>
      </form>
    </div>
  );
};

export default AnularPasajeForm;
