import Layout from "../../components/Layout";
import { useEffect, useState, forwardRef, useRef, useMemo } from "react";
import Head from "next/head";
import ActualizarDatos from "../../components/profile/ActualizarDatos/ActualizarDatos";
import MenuLateral from "../../components/profile/MenuLateral/MenuLateral";
import RegistroPasajero from "../../components/profile/RegistroPasajero/RegistroPasajero";
import CambiarPassword from "../../components/profile/CambiarPassword/CambiarPassword";
import HistorialCompra from "../../components/profile/historial-compra";
import { useLocalStorage } from "/hooks/useLocalStorage";
import Footer from "../../components/Footer";
import { useRouter } from "next/router";
import styles from "./home.module.css";

const Home = () => {
  const { getItem } = useLocalStorage();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(false);
  const [vista, setVista] = useState(null);
  const [nombreVista, setNombreVista] = useState("");
  const router = useRouter();

  useEffect(() => {
    let checkUser = getItem("user");
    if (checkUser == null) router.push("/");
    setUser(checkUser);
    setIsLoading(false);
    setVista("miPerfil");
    setNombreVista("Mi perfil");
  }, []);

  return (
    <Layout>
      <Head>
        <title>PullmanBus | Mi Perfil</title>
      </Head>
      <>
        <div className={`${styles["perfil-body"]} "row"`}>
          <div className={"d-flex justify-content-center"}>
            <div
              className={`${styles["container-perfil"]} "col-12 col-md-8 bloque mb-5"`}
            >
              <div className={"row"}>
                <div className={"col-12 col-md-2 text-center top"}>
                  <img src="../img/icon/profile/Perfil.svg" alt=""></img>
                </div>
                <div className={"col-12 col-md-6"}>
                  <img src="" alt="" />
                  <h2>
                    <strong className={styles["titulo-nombre"]}>¡Hola,</strong>
                  </h2>
                  <h2>
                    <strong className={styles["titulo-nombre-sub"]}>
                      {user?.nombres} {user?.apellidoPaterno}
                    </strong>
                  </h2>
                </div>
                <div className="col-12 col-md-2">
                  <img
                    className={styles["imagen-monedero"]}
                    src="../img/icon/profile/wallet-outline.svg"
                    alt=""
                  ></img>
                  <strong className={styles["titulo-wallet"]}>Monedero</strong>
                  <br />
                  <strong className={styles["titulo-wallet-sub"]}>
                    Virtual
                  </strong>
                  <br />
                  <strong className={styles["titulo-wallet-sub"]}>
                    ${user?.saldo}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className={"d-flex justify-content-center"}>
            <div className={"col-12 col-md-2"}>
              <MenuLateral 
              vista={vista} 
              setVista={setVista}
              setNombreVista={setNombreVista} />
            </div>
            <div className={"col-12 col-md-5"}>
              <div className={styles["titulo-menu"]}> Mi cuenta {">"} {nombreVista}</div>
              {vista === "miPerfil" && <ActualizarDatos />}
              {vista === "registroPasajero" && <RegistroPasajero 
              user={user} />}
              {vista === "cambioContraseña" && <CambiarPassword 
              setVista={setVista}/>}
              {vista === "historialCompra" && <HistorialCompra />}
              {vista === "confirmacion" && <MenuLateral />}
              {vista === "cambioBoleto" && <MenuLateral />}
              {vista === "devolucionBoleto" && <MenuLateral />}
            </div>
          </div>
        </div>
      </>

      <Footer />
    </Layout>
  );
};

export default Home;
