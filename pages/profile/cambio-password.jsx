import axios from "axios";
import Layout from "components/Layout";
import { useEffect, useState } from "react";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useForm } from "/hooks/useForm";
import Head from "next/head";

const changePasswordFormFields = {
  correo: "",
  contraseña: "",
  contraseñaNueva: "",
  contraseñaNueva2: "",
};

const CambioPassword = () => {
  const { formState: changePassword, onInputChange } = useForm(
    changePasswordFormFields
  );
  const router = useRouter();
  const { getItem } = useLocalStorage();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(false);
  const [alerta, setAlerta] = useState({
    msg: "",
    visible: false,
    type: ''
  });

  useEffect(() => {
    let checkUser = getItem("user");
    if (checkUser == null) router.push("/");
    setUser(checkUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    changePassword.correo = user?.correo
  }, [user]);
  

  const cambiarPassword = async () => {
    const formStatus = await validarForm();
    if (formStatus) {
      try {
        setIsLoading2(true);
        const res = await axios.post("/api/cambiar-password", {
          ...changePassword,
        });
        if(res.data.status){
            setIsLoading2(false);
            setAlerta({ visible: true, msg: res.data.message, type: "alert-success" });
            changePassword.contraseña = '';
            changePassword.contraseñaNueva = '';
            changePassword.contraseñaNueva2 = '';
        }
      } catch (e) {
        setIsLoading2(false);
        if (!!e.response) {
          const { message } = e.response?.data;
          setAlerta({ visible: true, msg: message, type: "alert-danger"});
        } else {
          setAlerta({ visible: true, msg: "Ocurrió un error inesperado.", type: "alert-danger" });
        }
      }
    }
  };

  const validarForm = () => {
    return new Promise((resolve, reject) => {
      if (
        changePassword.contraseña == "" ||
        changePassword.contraseñaNueva == "" ||
        changePassword.contraseñaNueva2 == ""
      ) {
        setAlerta({ visible: true, msg: "Rellene los campos vacios", type: "alert-danger" });
        return resolve(false);
      } else if (
        changePassword.contraseñaNueva != changePassword.contraseñaNueva2
      ) {
        setAlerta({ visible: true, msg: "Las contraseñas no coinciden. Por favor, verificar", type: "alert-danger" });
        return resolve(false);
      } else {
        return resolve(true);
      }
    });
  };

  return (
    <>
      <Layout>
        <Head>
          <title>PullmanBus | Cambiar Contraseña</title>
        </Head>
        {isLoading ? (
          <div className="d-flex justify-content-center mt-2">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden"></span>
            </div>
          </div>
        ) : (
          <>
            <div className="pullman-mas">
              <div className="container">
                <div className="row py-4">
                  <div className="col-12">
                    <span>Home &gt; Cambiar Contraseña </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="row pb-5">
              <div className="d-flex justify-content-center">
                <div className="col-12 col-md-6 bloque flex-column">
                  <h1 className="titulo-azul text-center">
                    Cambiar contraseña
                  </h1>
                  <div className="d-flex justify-content-center mt-2 mb-4">
                    <a href="/">Volver</a>
                  </div>
                  {alerta?.visible ? (
                    <div className={"alert " + alerta?.type} role="alert">
                      {alerta?.msg}
                    </div>
                  ) : (
                    ""
                  )}
                  {isLoading2 ? (
                    <div className="d-flex justify-content-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden"></span>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  <div className="row mt-4">
                    <div className="col-12 col-md-6">
                      <label className="label-input">Contraseña actual</label>
                      <input
                        type="password"
                        className="form-control"
                        name="contraseña"
                        value={changePassword?.contraseña}
                        onChange={onInputChange}
                      />
                    </div>
                  </div>
                  <div className="row mt-4">
                    <div className="col-12 col-md-6">
                      <label className="label-input">Contraseña nueva</label>
                      <input
                        type="password"
                        className="form-control"
                        name="contraseñaNueva"
                        value={changePassword?.contraseñaNueva}
                        onChange={onInputChange}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="label-input">
                        Confirmar contraseña nueva
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        name="contraseñaNueva2"
                        value={changePassword?.contraseñaNueva2}
                        onChange={onInputChange}
                      />
                    </div>
                    <div className="row mt-4 d-flex justify-content-center">
                      <div className="col-12 col-md-6">
                        <div className="">
                          <button
                            type="button"
                            className="btn"
                            onClick={(e) => cambiarPassword()}
                          >
                            Cambiar contraseña
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Layout>
    </>
  );
}

export default CambioPassword;
