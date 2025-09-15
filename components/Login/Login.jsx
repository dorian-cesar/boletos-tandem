// import { useState } from "react";
// import RecuperarPassword from "components/RecuperarPassword";
// import Registro from "components/Registro";
// import { useForm } from "/hooks/useForm";
// import { useLocalStorage } from "/hooks/useLocalStorage";
// import axios from "axios";
// import styles from "./Login.module.css";
// import { encryptData } from "utils/encrypt-data";
// import LocalStorageEntities from "entities/LocalStorageEntities";

// const loginFormFields = {
//   email: "",
//   password: "",
// };

// const Login = (props) => {
//   const { formState: login, onInputChange } = useForm(loginFormFields);
//   const { setItem } = useLocalStorage();
//   const [mode, setMode] = useState("0");
//   const [isLoading, setIsLoading] = useState(false);
//   const [alert, setAlert] = useState({
//     msg: "",
//     visible: false,
//     type: "",
//   });
//   const [emptyFields, setEmptyFields] = useState({
//     email: false,
//     password: false,
//   });

//   const changeMode = (mode) => {
//     if (mode != null) setMode(mode);
//   };

//   const changeAlert = (alert) => {
//     if (alert != null) setAlert(alert);
//   };

//   const onLogin = async () => {
//     if (login.email == "" || login.password == "") {
//       setAlert({
//         msg: "Rellene los campos vacíos.",
//         visible: true,
//         type: "text-danger",
//       });
//       setEmptyFields({
//         email: login.email === "",
//         password: login.password === "",
//       });
//       return;
//     }

//     try {
//       console.log("Iniciando sesión...");
//       setIsLoading(true);

//       const res = await axios.post("/api/user/validar-login", { ...login });
//       const { token, user } = res.data;

//       const nombresSplit = user.name.split(" ");
//       const nombres = nombresSplit[0];
//       const apellidoPaterno = nombresSplit[1];

//       const userLogged = {
//         nombres,
//         apellidoPaterno,
//         rut: user.rut,
//         correo: user.email,
//       };

//       encryptData(userLogged, LocalStorageEntities.user_auth);
//       encryptData(token, LocalStorageEntities.user_token);

//       setIsLoading(false);

//       const myModal = document.getElementById("loginModal");
//       myModal.hidden = true;
//       window.location.reload(false);
//     } catch (e) {
//       console.error(e);
//       setIsLoading(false);
//       if (e.response?.data?.message) {
//         setAlert({
//           msg: e.response.data.message,
//           visible: true,
//           type: "text-danger",
//         });
//       } else {
//         setAlert({
//           msg: "Ocurrió un error inesperado.",
//           visible: true,
//           type: "alert-danger",
//         });
//       }
//     }
//   };

//   return (
//     <>
//       <div
//         className="modal fade"
//         id="loginModal"
//         aria-labelledby="exampleModalLabel"
//         aria-hidden="true"
//       >
//         <div
//           className={
//             "modal-dialog modal-dialog-centered modal-dialog-scrollable" +
//             (mode == "2" ? " modal-lg" : "")
//           }
//         >
//           {mode == "0" ? (
//             <div className="modal-content">
//               <div className="modal-body">
//                 <form
//                   onSubmit={(e) => {
//                     e.preventDefault();
//                     onLogin();
//                   }}
//                 >
//                   <div className={`${styles["index-login"]} "container" `}>
//                     <div className="d-flex justify-content-center ">
//                       <img
//                         className={styles["foto-login"]}
//                         src="../../img/icon-foto.svg"
//                         width={65}
//                       ></img>
//                     </div>
//                     <p className={styles["viajemos-juntos"]}>
//                       ¡Viajemos juntos!
//                     </p>
//                     <p className={styles["ingresa-sesion"]}>
//                       Ingresa a tu sesión
//                     </p>
//                     <p className={styles["parrafo-registro"]}>
//                       Al registrarte o iniciar sesión, estás aceptando nuestros
//                       términos y condiciones de uso.
//                     </p>

//                     <div className="row text-center">
//                       {alert.visible ? (
//                         <div className={"alert " + alert?.type} role="alert">
//                           {alert?.msg}
//                         </div>
//                       ) : (
//                         ""
//                       )}
//                     </div>

//                     {isLoading ? (
//                       <div className="d-flex justify-content-center">
//                         <div
//                           className="spinner-border text-primary"
//                           role="status"
//                         >
//                           <span className="visually-hidden"></span>
//                         </div>
//                       </div>
//                     ) : (
//                       ""
//                     )}

//                     {Object.keys(loginFormFields).map((key) => (
//                       <div className="row mt-2" key={key}>
//                         <div className="col-12">
//                           <label className="label-input">
//                             {key === "email"
//                               ? "Correo electrónico"
//                               : "Contraseña"}
//                           </label>
//                           <input
//                             type={key === "password" ? "password" : "text"}
//                             placeholder={
//                               key === "email"
//                                 ? "Ej: example@example.com"
//                                 : "Ej: ******"
//                             }
//                             className={
//                               "form-control" +
//                               (emptyFields[key] ? " is-invalid" : "")
//                             }
//                             name={key}
//                             value={login[key]}
//                             onChange={onInputChange}
//                           />
//                           {emptyFields[key] && (
//                             <div className="invalid-feedback">
//                               Campo obligatorio
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     ))}

//                     <div className="d-flex justify-content-center">
//                       <button
//                         type="button"
//                         className="btn-link btn-modal-link"
//                         onClick={() => changeMode("1")}
//                       >
//                         ¿Olvidé mi password?
//                       </button>
//                     </div>
//                     <div className="d-flex justify-content-center">
//                       <button
//                         type="button"
//                         className="btn-link btn-modal-link"
//                         onClick={() => changeMode("2")}
//                       >
//                         Registrarme
//                       </button>
//                     </div>
//                   </div>

//                   <div className={styles["buttones"]}>
//                     <button
//                       type="submit"
//                       className="btn btn-modal-primary"
//                       style={{ width: "80%" }}
//                     >
//                       Ingresar
//                     </button>
//                     <button
//                       type="button"
//                       className="btn btn-modal-secondary"
//                       style={{ marginTop: 0, width: "80%" }}
//                       data-bs-dismiss="modal"
//                       aria-label="Close"
//                     >
//                       Seguir como invitado
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           ) : mode == "1" ? (
//             <RecuperarPassword
//               onChangeMode={changeMode}
//               onChangeAlert={changeAlert}
//             />
//           ) : (
//             <Registro onChangeMode={changeMode} onChangeAlert={changeAlert} />
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default Login;

import { useState } from "react";
import RecuperarPassword from "components/RecuperarPassword";
import Registro from "components/Registro";
import { useForm } from "/hooks/useForm";
import { useLocalStorage } from "/hooks/useLocalStorage";
import axios from "axios";
import styles from "./Login.module.css";
import { encryptData } from "utils/encrypt-data";
import { decryptData } from "utils/encrypt-data";
import LocalStorageEntities from "entities/LocalStorageEntities";

const loginFormFields = {
  email: "",
  password: "",
};

const Login = ({ onLoginSuccess }) => {
  const token = decryptData(LocalStorageEntities.user_token);
  if (token) return null; // <-- si ya hay token, no renderizamos nada
  const { formState: login, onInputChange } = useForm(loginFormFields);
  const { setItem } = useLocalStorage();
  const [mode, setMode] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({
    msg: "",
    visible: false,
    type: "",
  });
  const [emptyFields, setEmptyFields] = useState({
    email: false,
    password: false,
  });

  const changeMode = (mode) => {
    if (mode != null) setMode(mode);
  };

  const changeAlert = (alert) => {
    if (alert != null) setAlert(alert);
  };

  const onLogin = async () => {
    if (login.email === "" || login.password === "") {
      setAlert({
        msg: "Rellene los campos vacíos.",
        visible: true,
        type: "text-danger",
      });
      setEmptyFields({
        email: login.email === "",
        password: login.password === "",
      });
      return;
    }

    try {
      setIsLoading(true);

      const res = await axios.post("/api/user/validar-login", { ...login });
      const { token, user } = res.data;

      const nombresSplit = user.name.split(" ");
      const nombres = nombresSplit[0];
      const apellidoPaterno = nombresSplit[1];

      const userLogged = {
        nombres,
        apellidoPaterno,
        rut: user.rut,
        correo: user.email,
      };

      encryptData(userLogged, LocalStorageEntities.user_auth);
      encryptData(token, LocalStorageEntities.user_token);

      setIsLoading(false);

      // Llamamos al callback de Home para indicar que ya inició sesión
      onLoginSuccess && onLoginSuccess();
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      if (e.response?.data?.message) {
        setAlert({
          msg: e.response.data.message,
          visible: true,
          type: "text-danger",
        });
      } else {
        setAlert({
          msg: "Ocurrió un error inesperado.",
          visible: true,
          type: "alert-danger",
        });
      }
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div
        className={
          "modal-dialog modal-dialog-centered modal-dialog-scrollable" +
          (mode === "2" ? " modal-lg" : "")
        }
      >
        {mode === "0" ? (
          <div className="modal-content">
            <div className="modal-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onLogin();
                }}
              >
                <div className={`${styles["index-login"]} container`}>
                  <div className="d-flex justify-content-center ">
                    <img
                      className={styles["foto-login"]}
                      src="../../img/icon-foto.svg"
                      width={65}
                      alt="Foto login"
                    />
                  </div>
                  <p className={styles["viajemos-juntos"]}>¡Viajemos juntos!</p>
                  <p className={styles["ingresa-sesion"]}>
                    Ingresa a tu sesión
                  </p>
                  <p className={styles["parrafo-registro"]}>
                    Al registrarte o iniciar sesión, estás aceptando nuestros
                    términos y condiciones de uso.
                  </p>

                  {alert.visible && (
                    <div className={"alert " + alert?.type} role="alert">
                      {alert?.msg}
                    </div>
                  )}

                  {isLoading && (
                    <div className="d-flex justify-content-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden"></span>
                      </div>
                    </div>
                  )}

                  {Object.keys(loginFormFields).map((key) => (
                    <div className="row mt-2" key={key}>
                      <div className="col-12">
                        <label className="label-input">
                          {key === "email"
                            ? "Correo electrónico"
                            : "Contraseña"}
                        </label>
                        <input
                          type={key === "password" ? "password" : "text"}
                          placeholder={
                            key === "email"
                              ? "Ej: example@example.com"
                              : "Ej: ******"
                          }
                          className={
                            "form-control" +
                            (emptyFields[key] ? " is-invalid" : "")
                          }
                          name={key}
                          value={login[key]}
                          onChange={onInputChange}
                        />
                        {emptyFields[key] && (
                          <div className="invalid-feedback">
                            Campo obligatorio
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="d-flex justify-content-center mt-2">
                    <button
                      type="button"
                      className="btn-link btn-modal-link"
                      onClick={() => changeMode("1")}
                    >
                      ¿Olvidé mi password?
                    </button>
                  </div>
                  <div className="d-flex justify-content-center mt-2">
                    <button
                      type="button"
                      className="btn-link btn-modal-link"
                      onClick={() => changeMode("2")}
                    >
                      Registrarme
                    </button>
                  </div>
                </div>

                <div className={styles["buttones"]}>
                  <button
                    type="submit"
                    className="btn btn-modal-primary"
                    style={{ width: "80%" }}
                  >
                    Ingresar
                  </button>

                  {/* Botón de invitado eliminado para forzar login */}
                </div>
              </form>
            </div>
          </div>
        ) : mode === "1" ? (
          <RecuperarPassword
            onChangeMode={changeMode}
            onChangeAlert={changeAlert}
          />
        ) : (
          <Registro onChangeMode={changeMode} onChangeAlert={changeAlert} />
        )}
      </div>
    </div>
  );
};

export default Login;
