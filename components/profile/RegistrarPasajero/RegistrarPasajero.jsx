import styles from "./RegistrarPasajero.module.css";
import { useEffect, useState, forwardRef, useRef, useMemo } from "react";
import { useForm } from "/hooks/useForm";
import axios from "axios";
import DatePicker, { registerLocale } from "react-datepicker";

const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <input
    type="text"
    className={styles["input-data"]}
    onClick={onClick}
    ref={ref}
    value={value}
    onChange={() => {}}
  />
));


const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const actualizarFormFields = {
  rut: "",
  apellidoMaterno: "",
  apellidoPaterno: "",
  correo: "",
  correo2: "",
  fechaNacimiento: "",
  nombres: "",
  tipoDocumento: "R",
  sexo: "",
};


const RegistrarPasajero = (props) => {
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const { formState: data, onInputChange } = useForm(actualizarFormFields);
    const listaYears = useMemo(() => {
      let years = [];
      for (let i = new Date().getFullYear(); i >= 1910; i--) {
        years.push(i);
      }
      return years;
    }, []);
    return(
        <>
         <div className={styles["menu-central"]}>
        <div className={`${styles["bloque"]} "col-12 col-md-12"`}>
          <h1 className={styles["title-modify-data"]}>Registrar pasajero</h1>
        
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