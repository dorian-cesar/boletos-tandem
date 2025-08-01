import styles from "./PreguntasFrecuente.module.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import Acordeon from "../Acordeon/Acordeon";

const PreguntasFrecuente = (props) => {
  const [encabezados, setEncabezados] = useState([]);
  const [preguntas, setPregunas] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [preguntasFiltradas, setPreguntasFiltradas] = useState([]);

  useEffect(() => {
    const obtenerEncabezados = async () => {
      try {
        let response = await axios.post(
          "/api/parametros/obtener-encabezados",
          {}
        );
        if (response && response.data && response.data.status) {
          const dataObject = response.data.object;
          if (dataObject && Array.isArray(dataObject)) {
            setEncabezados(dataObject);
          }
        }
      } catch (e) {
        console.log("Error al obtener encabezados:", e);
      }
    };
    obtenerEncabezados();
  }, []);

  useEffect(() => {
    const filtrarPreguntas = () => {
      const preguntasFiltradas = preguntas.filter(
        (item) =>
          item.pregunta.toLowerCase().includes(buscar.toLowerCase()) ||
          item.respuesta.toLowerCase().includes(buscar.toLowerCase())
      );
      setPreguntasFiltradas(preguntasFiltradas);
    };
    filtrarPreguntas();
  }, [buscar, preguntas]);

  const handleInputChange = (e) => {
    setBuscar(e.target.value);
  };

  async function cambiarVista(id) {
    let datos = {
      id: id,
    };
    try {
      const { data } = await axios.post(
        "/api/parametros/obtener-preguntas-encabezado",
        datos
      );
      if (data?.status) {
        setPregunas(data?.object);
      }
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <>
      <div className={styles["body"]}>
        <div className="row w-100">
          <div className="container">
            <div className="d-flex justify-content-evenly flex-wrap">
              <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-4 col-xxl-3">
                <div className={styles["menu-lateral"]}>
                  <div className={styles["menu-text-title"]}>
                    Encuentra tus respuestas aquí:
                  </div>

                  <div
                    className={`${styles["menu-lateral"]} "col-12 col-md-2"`}
                  >
                    {encabezados.map((opcion) => (
                      <div
                        key={opcion.id}
                        className={`${styles["item-menu-lateral"]} "row"`}
                        onClick={() => cambiarVista(opcion.id)}
                      >
                        <div className={styles["item-image"]}>
                          <img
                            src={`/img/icon/question/${opcion.nombreIcono}.svg`}
                            alt=""
                          />
                        </div>
                        <a className={styles["item-texto-lateral"]}>
                          {opcion.nombreEncabezado}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-7 col-lg-7 col-xl-6 col-xxl-7 mt-3 mb-5">
                <div className={styles["search"]}>
                  <input
                    type="text"
                    value={buscar}
                    name="nombre"
                    placeholder="Buscar"
                    className={styles["input-search"]}
                    onChange={handleInputChange}
                  />
                </div>
                {!buscar || preguntasFiltradas.length === 0
                  ? preguntas.map((item) => (
                      <Acordeon
                        key={item.id.idDetalle}
                        title={item.pregunta}
                        textoPreguntasFrecuentes={item.respuesta}
                      />
                    ))
                  : 
                    preguntasFiltradas.map((item) => (
                      <Acordeon
                        key={item.id.idDetalle}
                        title={item.pregunta}
                        textoPreguntasFrecuentes={item.respuesta}
                      />
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PreguntasFrecuente;
