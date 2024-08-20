import Layout from "../../components/Layout";
import Footer from "../../components/Footer";
import styles from "./viajes-especiales.module.css"
import es from "date-fns/locale/es";
import DatePicker, { registerLocale } from "react-datepicker";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import { useEffect, useState, } from "react";
import { useForm } from "/hooks/useForm";
import Rut from "rutjs";

registerLocale("es", es);

const SolicitudFormFields = {
  nombres: "",
  rut: "",
  numeroContacto: "",
  mail: "",
  mail2: "",
  cantPasajero: "",
  origenViaje: "",
  destinoViaje: "",
  mensaje: "",
  tipoDocumento: "R",

}

export default function Home(props) {
  const [isLoading, setIsLoading] = useState(false);
  const { formState: solicitud, onInputChange } = useForm(SolicitudFormFields);
  const [error, setError] = useState({
    errorMsg: '',
    status: false
  });

  const [alerta, setAlerta] = useState({
    msg: "",
    visible: false,
    type: "",
  });

  const enviar = async () => {
    const formStatus = await validarForm();
    if (formStatus) {
      try {
        setIsLoading(true);
        // const res = await axios.post("/api/user/registro-usuario", {...registro});
        // if(res.data.status){
        //   onChangeAlert({
        //     msg: '¡Registro completado con éxito!',
        //     visible: true,
        //     type: 'alert-success'
        //   })
        //   changeMode();
        // }
      } catch (e) {
        setIsLoading(false);
        if (!!e.response) {
          const { message } = e.response?.data;
          setError({ status: true, errorMsg: message });
        } else {
          setError({ status: true, errorMsg: 'Ocurrió un error inesperado.' });
        }
      }
    }
  }

  const validarForm = () => {
    return new Promise((resolve, reject) => {
      const values = Object.values(solicitud);
      const camposVacios = values.filter((v) => v == '');
      if (camposVacios.length > 0) {
        setError({ status: true, errorMsg: 'Se requiere rellenar todos los campos.' });
        resolve(false);
      } else if (solicitud.cantPasajero == 0) {
        setError({ status: true, errorMsg: 'Se requiere cantidad de pasajeros sea mayor a 0.' });
        resolve(false);

      } else if (solicitud.cantPasajero > 500) {
        setError({ status: true, errorMsg: 'Se requiere cantidad de pasajeros sea menor a 500.' });
        resolve(false);
      } else {
        if (solicitud?.tipoDocumento == 'R') {
          let rut = new Rut(solicitud?.rut);
          if (!rut?.isValid) {
            setError({ status: true, errorMsg: 'Se requiere ingresar un rut válido' });
            return resolve(false);
          }
        }
        if (solicitud?.mail != solicitud?.mail2) {
          setError({ status: true, errorMsg: 'Los correo no coinciden. Por favor, verificar.' });
          resolve(false);
        } else {
          setError({ status: false, errorMsg: '' });
          resolve(true);
        }
      }
    })
  }

  return (
    <Layout>
      <Head>
        <title>Pullman Bus | Viaje Especiale</title>
      </Head>
      <div className={styles["home"]}>
        <div className="pullman-mas">
          <div className="container">
            <div className={`row py-4 ${styles["nav"]}`}>
              <span>Inicio  &gt; Solicita Viajes Especiales</span>
            </div>
          </div>
        </div>
        <div className={`mb-5 container ${styles["bloque"]} "col-12 col-md-12"`}>
          <h1 className={styles["title-modify-data"]}>
            Solicita aquí tu(s) viaje(s) especial(es)
          </h1>
          {alerta?.visible ? (
            <div className={"alert " + alerta?.type} role="alert">
              {alerta?.msg}
            </div>
          ) : (
            ""
          )}
          {isLoading ? (
            <div className={"d-flex justify-content-center"}>
              <div className={"spinner-border text-primary"} role="status">
                <span className="visually-hidden"></span>
              </div>
            </div>
          ) : (
            ""
          )}

          <div className={"row"}>
            <div className={styles["bloque-texto"]}>
              <p>
                ¡Experimenta del transporte exclusivo para ti, tu empresa, fundación o club deportivo! Contáctanos ahora para solicitar una cotización
                personalizada y descubre cómo podemos llevar tu experiencia de transporte al siguiente nivel. ¡Esperamos tu mensaje!
              </p>
            </div>
          </div>
          <div className="row mt-2">
            {error.status ?
              <div className="alert alert-danger" role="alert">
                {error?.errorMsg}
              </div> : ''
            }
          </div>
          {isLoading ?
            <div className="d-flex justify-content-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden"></span>
              </div>
            </div> : ''
          }
          <div className={styles["cuadro"]}>
            <div className={"row"} >
              <div className={"col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"}>
                <label className={styles["title-data"]}>Nombre(s): </label>
                <input
                  type="text"
                  className={styles["input-data"]}
                  name="nombres"
                  placeholder="Ej: Emma Cortez"
                  value={solicitud.nombres}
                  onChange={onInputChange}
                />
              </div>
              <div className={"col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"}>
                <div className={`${styles["rut"]} row`}>
                  <div className="col-3 col-sm-3 col-md-4">
                    <label className="contenedor">
                      RUT
                      <input
                        type="checkbox"
                        value={"R"}
                        name="tipoDocumento"
                        onChange={onInputChange}
                        checked={
                          solicitud?.tipoDocumento == "R"
                            ? true
                            : false
                        } />
                      <span className="checkmark"></span>
                    </label>
                  </div>
                  <div className="col-4">
                    <label className="contenedor">
                      DNI
                      <input
                        type="checkbox"
                        value={"D"}
                        name="tipoDocumento"
                        onChange={onInputChange}
                        checked={
                          solicitud?.tipoDocumento == "D"
                            ? true
                            : false
                        } />
                      <span className="checkmark"></span>
                    </label>
                  </div>
                  <div className="col-4">
                    <label className="contenedor">
                      Pasaporte
                      <input
                        type="checkbox"
                        value={"P"}
                        name="tipoDocumento"
                        onChange={onInputChange}
                        checked={
                          solicitud?.tipoDocumento == "P"
                            ? true
                            : false
                        }
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder={solicitud?.tipoDocumento != 'R' ? 'Ej. 111111111' : 'Ej. 11111111-1'}
                  disabled={solicitud?.tipoDocumento != '' ? false : true}
                  className={styles["input-data"]}
                  name="rut"
                  value={solicitud?.rut}
                  onChange={onInputChange}
                />
              </div>
            </div>

            <div className={"row "}>
              <div className={"col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"}>
                <label className={styles["title-data"]}>N° de Contacto: </label>
                <input
                  type="text"
                  className={styles["input-data"]}
                  name="numeroContacto"
                  placeholder="Ej: +56 9 1111 1111"
                  value={solicitud?.numeroContacto}
                  onChange={onInputChange}
                />
              </div>
              <div className={"col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"}>
                <label className={styles["title-data"]}>Correo electrónico: </label>
                <input
                  type="email"
                  className={styles["input-data"]}
                  name="mail"
                  placeholder="Ej: ecortez@gmail.com"
                  value={solicitud?.mail}
                  onChange={onInputChange}
                />
              </div>
            </div>
            <div className={"row "}>
              <div className={"col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"}>
                <label className={styles["title-data"]}>Correo electrónico: </label>
                <input
                  type="email"
                  className={styles["input-data"]}
                  name="mail2"
                  placeholder="Ej: ecortez@gmail.com"
                  value={solicitud?.mail2}
                  onChange={onInputChange}
                />
              </div>
              <div className={"col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"}>
                <label className={styles["title-data"]}>Cantidad de Pasajero:</label>
                <input
                  type="number"
                  className={styles["input-data"]}
                  name="cantPasajero"
                  placeholder="Ej: 30"
                  value={solicitud?.cantPasajero}
                  min={0}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,3}$/.test(value)) {
                      onInputChange(e);
                    }
                  }}
                />
              </div>
            </div>

            <div className={"row"}>
              <div className={"col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"}>
                <label className={styles["title-data"]}>Origen del viaje: </label>
                <input
                  type="text"
                  className={styles["input-data"]}
                  name="origenViaje"
                  placeholder="Ej: Santiago"
                  value={solicitud?.origenViaje}
                  onChange={onInputChange}
                />
              </div>
              <div className={"col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"}>
                <label className={styles["title-data"]}>Destino del viaje: </label>
                <input
                  type="text"
                  className={styles["input-data"]}
                  name="destinoViaje"
                  placeholder="Ej: La Serena"
                  value={solicitud?.destinoViaje}
                  onChange={onInputChange}
                />
              </div>
            </div>
            <div className={"row"}>
              <div className={"col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xxl-12"}>
                <label className={styles["title-data"]}>Mensaje: </label>
                <textarea
                  className={styles["textarea-data-mensaje"]}
                  name="mensaje"
                  placeholder="Cantidad max. 500 caracteres"
                  maxLength={500}
                  value={solicitud?.mensaje}
                  onChange={onInputChange}
                />
              </div>
            </div>
            <div className={"row"}>
              <div className={"col-12"}>
                <div className={styles["grupo-campos"]}>
                  <div className={styles["button"]}>
                    <button
                      className={
                        SolicitudFormFields
                          ? styles["button-search-coupon"]
                          : styles["button-search-coupon-disabled"]
                      }
                      onClick={(e) => enviar()}
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
      <Footer />
    </Layout>
  );
}


