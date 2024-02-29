import styles from "./RegistrarPasajero.module.css";

const RegistrarPasajero = (props) => {

    return(
        <>
         <div className={styles["menu-central"]}>
        <div className={`${styles["bloque"]} "col-12 col-md-12"`}>
          <h1 className={styles["title-modify-data"]}>Modificar mis datos</h1>
          {alerta?.visible ? (
            <div className={"alert " + alerta?.type} role="alert">
              {alerta?.msg}
            </div>
          ) : (
            ""
          )}
          {isLoading2 ? (
            <div className={"d-flex justify-content-center"}>
              <div className={"spinner-border text-primary"} role="status">
                <span className="visually-hidden"></span>
              </div>
            </div>
          ) : (
            ""
          )}
          <div className={"row"}>
            <div className={"col-6"}>
              <label className={styles["title-data"]}>Nombre(s)</label>
              <input
                type="text"
                className={styles["input-data"]}
                name="nombres"
                value={data?.nombres}
                onChange={onInputChange}
              />
            </div>
          </div>
          <div className={"row "}>
            <div className={"col-6"}>
              <label className={styles["title-data"]}>Apellido Paterno</label>
              <input
                type="text"
                className={styles["input-data"]}
                name="apellidoPaterno"
                value={data?.apellidoPaterno}
                onChange={onInputChange}
              />
            </div>
            <div className={"col-6"}>
              <label className={styles["title-data"]}>Apellido Materno</label>
              <input
                type="text"
                className={styles["input-data"]}
                name="apellidoMaterno"
                value={data?.apellidoMaterno}
                onChange={onInputChange}
              />
            </div>
          </div>
          <div className={"row"}>
            <div className={"col-6"}>
              <label className={styles["title-data"]}>Género</label>
              <select
                name="sexo"
                id="sexo"
                className={styles["input-data"]}
                value={data?.sexo}
                onChange={onInputChange}
              >
                <option value={""}>Seleccione una opción...</option>
                <option value={"FEMENINO"}>Femenino</option>
                <option value={"MASCULINO"}>Masculino</option>
                <option value={"OTRO"}>Otro</option>
              </select>
            </div>
            <div className={"col-6"}>
              <label className={styles["title-data"]}>
                Fecha de nacimiento
              </label>
              <DatePicker
                renderCustomHeader={({
                  date,
                  changeYear,
                  changeMonth,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => (
                  <div
                    style={{
                      margin: 10,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={decreaseMonth}
                      disabled={prevMonthButtonDisabled}
                    >
                      {"<"}
                    </button>
                    <select
                      onChange={({ target: { value } }) => changeYear(value)}
                    >
                      {listaYears.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <select
                      value={months[date.getMonth()]}
                      onChange={({ target: { value } }) =>
                        changeMonth(months.indexOf(value))
                      }
                    >
                      {months.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={increaseMonth}
                      disabled={nextMonthButtonDisabled}
                    >
                      {">"}
                    </button>
                  </div>
                )}
                selected={fechaNacimiento}
                onChange={(date) => setFechaNacimiento(date)}
                dateFormat="dd/MM/yyyy"
                locale={"es"}
                placeholderText={""}
                customInput={<CustomInput />}
              />
            </div>
          </div>
          <div className={"row"}>
            <div className={"col-6"}>
              <label className={styles["title-data"]}>Correo electrónico</label>
              <input
                type="email"
                className={styles["input-data"]}
                name="correo"
                value={data?.correo}
                disabled
              />
            </div>
          </div>
          <div className={"row"}>
            <div className={"col-6"}>
              <div className={styles["return"]}>
                <a href="/">Regresar</a>
              </div>
            </div>
            <div className={"col-6"}>
              <div
                type="button"
                className={styles["button-update"]}
                onClick={(e) => actualizarDatos()}
              >
                Actualizar datos
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
    )
}

export default RegistrarPasajero;