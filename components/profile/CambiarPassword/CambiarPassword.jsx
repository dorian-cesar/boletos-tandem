import axios from "axios";
import { useEffect, useState } from "react";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useForm } from "/hooks/useForm";
import styles from "./CambiarPassword.module.css";
import Popup from "../../Popup/Popup";
import { toast } from "react-toastify";
import ModalEntities from "../../../entities/ModalEntities";

const changePasswordFormFields = {
  correo: "",
  contraseña: null,
  contraseñaNueva: null,
  contraseñaNueva2: null,
};

const CambiarPassword = (props) => {
  const { setVista } = props;
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [mostrarContraseñaIncorrectaPopup, setmostrarContraseñaIncorrectaPopup] = useState(false);
  const { formState: changePassword, onInputChange } = useForm(
    changePasswordFormFields
  );
  const router = useRouter();
  const { getItem } = useLocalStorage();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(false);

  useEffect(() => {
    let checkUser = getItem("user");
    if (checkUser == null) router.push("/");
    setUser(checkUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    changePassword.correo = user?.correo;
  }, [user]);

  const cambiarPassword = async () => {
    const formStatus = await validarForm();
    if (formStatus) {
      try {
        setIsLoading2(true);
        const res = await axios.post("/api/user/cambiar-password", {
          ...changePassword,
        });
        if (res.data.status) {
          changePassword.contraseña = "";
          changePassword.contraseñaNueva = "";
          changePassword.contraseñaNueva2 = "";
          abrirPopup()
        }
      } catch (e) {
        setIsLoading2(false);
        if (!!e.response) {
          const { message } = e.response?.data;
        } else {
          console.log("");
        }
      }
    }
  };

  const validarForm = () => {
    debugger;
    return new Promise((resolve, reject) => {
      if (
        changePassword.contraseña == "" ||
        changePassword.contraseñaNueva == "" ||
        changePassword.contraseñaNueva2 == ""
      ) {
        return resolve(false);
      } else if (
        changePassword.contraseñaNueva != changePassword.contraseñaNueva2
      ) {
        abrirContraseñaIncorrectaPopup()
        return resolve(false);
      } else {
        return resolve(true);
      }
    });
  };

  const abrirPopup = () => {
    setMostrarPopup(true);
  };
  const cerrarPopup = () => {
    setMostrarPopup(false);
  };

  const abrirContraseñaIncorrectaPopup = () => {
    setmostrarContraseñaIncorrectaPopup(true);
  };
  const cerrarContraseñaIncorrectaPopup = () => {
    setmostrarContraseñaIncorrectaPopup(false);
  };

  const volverInicio = () =>{
    setVista("miPerfil")
  }
  return (
    <div className={styles["menu-central"]}>
      <div className={`${styles["bloque"]} "col-12 col-md-12"`}>
        <div className={"row "}>
          <div className={"col-6"}>
            <a className={styles["title-change-password"]}>Cambio contraseña</a>
          </div>
        </div>

        <div className={"row"}>
          <div className={"col-6"}>
            <label className={styles["title-data"]}>Contraseña actual</label>
            <input
              type="password"
              className={styles["input-data"]}
              name="contraseña"
              value={changePassword?.contraseña}
              onChange={onInputChange}
            />
          </div>
        </div>
        <div className={"row "}>
          <div className={"col-6"}>
            <label className={styles["title-data"]}>Contraseña nueva</label>
            <input
              type="password"
              className={styles["input-data"]}
              name="contraseñaNueva"
              value={changePassword?.contraseñaNueva}
              onChange={onInputChange}
            />
          </div>
          <div className={"col-6"}>
            <label className={styles["title-data"]}>
              Repetir Contraseña nueva
            </label>
            <input
              type="password"
              className={styles["input-data"]}
              name="contraseñaNueva2"
              value={changePassword?.contraseñaNueva2}
              onChange={onInputChange}
            />
          </div>
        </div>
        <div className={"row"}>
          <div className={"col-6"}>
            <div className={styles["return"]}>
              <a onClick={(e) => setVista("miPerfil")} >Regresar</a>
            </div>
          </div>
          <div className={"col-6"}>
            <div
              type="button"
              className={ (changePassword.contraseña && changePassword.contraseñaNueva) ? styles["button-update"] : styles["button-update-disabled"]}
              onClick={(e) => (changePassword.contraseña && changePassword.contraseñaNueva && changePassword.contraseña2) ? "" : cambiarPassword()}
            >
              Cambiar contraseña
            </div>
          </div>
        </div>
      </div>
      {mostrarPopup && (
          <Popup
            modalKey={ModalEntities.change_password}
            modalClose={cerrarPopup}
            modalMethods={volverInicio}
          />
        )}
      {mostrarContraseñaIncorrectaPopup && (
        <Popup
          modalKey={ModalEntities.password_not_same}
          modalClose={cerrarContraseñaIncorrectaPopup}
          modalMethods={cerrarContraseñaIncorrectaPopup}
        />
      )}
    </div>
  );
};

export default CambiarPassword;
