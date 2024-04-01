import axios from "axios";
import DatePicker, { registerLocale } from "react-datepicker";
import Layout from "../../Layout";
import { useEffect, useState, forwardRef, useRef, useMemo } from "react";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useForm } from "/hooks/useForm";
import styles from "./ActualizarDatos.module.css";
import Head from "next/head";

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

const ActualizarDatos = () => {
  const { formState: data, onInputChange } = useForm(actualizarFormFields);
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const router = useRouter();
  const { getItem } = useLocalStorage();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(false);
  const [alerta, setAlerta] = useState({
    msg: "",
    visible: false,
    type: "",
  });

  useEffect(() => {
    let checkUser = getItem("user");
    if (checkUser == null) router.push("/");
    setUser(checkUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    data.nombres = user?.nombres;
    data.apellidoPaterno = user?.apellidoPaterno;
    data.apellidoMaterno = user?.apellidoMaterno;
    data.sexo = user?.sexo;
    data.correo = user?.correo;
    data.correo2 = user?.correo;
    data.rut = user?.rut;
    if (!!user?.fechaNacimiento) {
      let fecha = new Date(
        String(user?.fechaNacimiento).substring(
          0,
          String(user?.fechaNacimiento).length - 5
        )
      );
      setFechaNacimiento(fecha);
    }
  }, [user]);

  useEffect(() => {
    data.fechaNacimiento = fechaNacimiento;
  }, [fechaNacimiento]);

  const listaYears = useMemo(() => {
    let years = [];
    for (let i = new Date().getFullYear(); i >= 1910; i--) {
      years.push(i);
    }
    return years;
  }, []);

  const actualizarDatos = async () => {
    const formStatus = await validarForm();
    if (formStatus) {
      setIsLoading2(true);
      const res = await axios.post("../api/user/actualizar-datos-perfil", {
        ...data,
      });
      if (res.data.status) {
        setIsLoading2(false);
        setAlerta({
          visible: true,
          msg: res.data.message,
          type: "alert-success",
        });
        setTimeout(() => {
          setAlerta({ visible: false, msg: "", type: "" });
        }, 5000);
      }
      setIsLoading2(false);
    }
  };

  const validarForm = () => {
    return new Promise((resolve, reject) => {
      const values = Object.values(data);
      const camposVacios = values.filter((v) => v == "");
      if (camposVacios.length > 0) {
        setAlerta({
          visible: true,
          msg: "Se requiere rellenar todos los campos.",
          type: "alert-danger",
        });
        resolve(false);
      } else {
        if (data?.correo != data?.correo2) {
          setAlerta({
            visible: true,
            msg: "Los correos no coinciden. Por favor, verificar.",
            type: "alert-danger",
          });
          resolve(false);
        } else {
          setAlerta({ visible: false, msg: "", type: "" });
          resolve(true);
        }
      }
    });
  };

  return (
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
  );
};

export default ActualizarDatos;
