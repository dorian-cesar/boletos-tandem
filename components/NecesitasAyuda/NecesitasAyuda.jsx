import styles from "./NecesitasAyuda.module.css";

const NecesitasAyuda = (props) => {
  return (
    <>
      <div className={styles["body"]}>
        <div className="row">
          <div className="container">
            <div className="d-flex justify-content-center">
              <div className="col-10 col-md-8">
                <div className={styles["container"]}>
                  <div className="row">
                    <span className={styles["title"]}>¿Necesitas ayuda?</span>
                  </div>
                  <div className="row">
                    <span className={styles["sub-title"]}>
                      ¿Alguna pregunta, consulta o reclamo en mente? ¡No dudes
                      en enviarnos un mensaje! Estamos listos para actuar y
                      responder lo más rápido posible.
                    </span>
                  </div>
                  <div className="row">
                    <div className={styles["body-form"]}>
                      <div className={"row"}>
                        <div className={"col"}>
                          <label className={styles["title-data"]}>
                            Nombre(s)
                          </label>
                          <input
                            type="text"
                            className={styles["input-data"]}
                            name="nombres"
                            placeholder="Ej: Emma Cortez"
                          />
                        </div>
                      </div>
                      <div className={"row"}>
                        <div className={"col-6"}>
                          <label className={styles["title-data"]}>
                            N° de contacto
                          </label>
                          <input
                            type="text"
                            className={styles["input-data"]}
                            name="nombres"
                            placeholder="Ej: +56 9 1111 1111"
                          />
                        </div>
                        <div className={"col-6"}>
                          <label className={styles["title-data"]}>
                            Correo electrónico
                          </label>
                          <input
                            type="text"
                            className={styles["input-data"]}
                            name="nombres"
                            placeholder="Ej: ecortez@gmail.com"
                          />
                        </div>
                      </div>
                      <div className={"row"}>
                          <div className={"col-12"}>
                            <label className={styles["title-data"]}>
                              Cuerpo mensaje
                            </label>
                            <textarea
                              type="text"
                              className={styles["input-data-message"]}
                              name="nombres"
                              placeholder="Opcional"
                            />
                          </div>
                        </div>
                        <div className={"row"}>
                        <div className={"col-12"}>
                          <div className={styles["button"]}>
                                Enviar
                            </div>
                        </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NecesitasAyuda;
