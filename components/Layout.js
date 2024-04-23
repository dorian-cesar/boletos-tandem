import Head from "next/head";
import Header from "./Header/Header";
import { useEffect, useState } from "react";
import Link from "next/link";

import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import { liberarAsientos } from "store/usuario/compra-slice";
import { limpiarCambio } from "store/usuario/cambio-boleto-slice";


export default function Layout({ children }) {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  const closeNav = () => {
    setOpen(false);
  };
  const openNav = () => {
    setOpen(true);
  };

  useEffect(() => {
    if( !router.pathname.includes('respuesta-transaccion') ) {
      dispatch(liberarAsientos());
      dispatch(limpiarCambio());
    }
  }, [router.pathname])

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <title>Pullman Bus</title>
      </Head>

      <Header openNav={openNav} />

      <main>{children}</main>
      <Drawer
        open={ open }
        direction="left"
        className="overlay"
        zIndex={ 9999 }
        size="50vh"
      >
        <a className="closebtn" onClick={closeNav}>
          ×
        </a>
        <div className="overlay-content">
          <div className="links-menu">
            <div className="w-100">
              <Link href="/comprar" legacyBehavior>
                <a href="/comprar" className="compra">
                  Compra tu pasaje
                </a>
              </Link>
            </div>
            <div className="w-100">
              <Link href="/cuponera" legacyBehavior>
                <a href="/Cuponera" className="cuponeras">
                  Cuponera
                </a>
              </Link>
            </div>
            <div className="w-100">
              <Link href="/confirmacionBoleto" legacyBehavior>
                <a href="" className="confirmacions">
                  Confirmación
                </a>
              </Link>
            </div>
            <div className="w-100">
              <Link href="/cambioBoleto" legacyBehavior>
                <a className="cambio-boleto">
                  Cambio de boleto
                </a>
              </Link>
            </div>
            <div className="w-100">
              <Link href="/devolucion" legacyBehavior>
                <a className="devolucion">
                  Devolución de boleto
                </a>
              </Link>
            </div>
            <div className="w-100">
              <Link href="" legacyBehavior>
                <a href="/comprar" className="viajes-especiales">
                  Viajes especiales
                </a>
              </Link>
            </div>
            <div className="w-100">
              <a
                href="https://pullmanempresas.cl/#/sessions/signin?return=%2Fempresa%2Fhome"
                className="cliente-empresa"
              >
                Cliente Empresas
              </a>
            </div>
            
            <div className="w-100">
              <Link href="/teAyudamos" legacyBehavior>
                <a className="ayuda">
                  Te ayudamos
                </a>
              </Link>
            </div>
          </div>
          <div className="contactanos-menu">
            <span>Síguenos :</span>
            <div>
              <a target="_blank" href="https://www.facebook.com/Pullman.cl/">
                <img src="img/icon/chat/logo-facebook-color.svg" alt="" />
              </a>
              <a target="_blank" href="https://www.instagram.com/pullmanbus/">
                <img src="img/icon/chat/logo-instagram-color.svg" alt="" />
              </a>
              <a
                target="_blank"
                href="https://www.linkedin.com/company/pullman-bus/"
              >
                <img src="img/icon/chat/logo-linkedin-color.svg" alt="" />
              </a>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}
