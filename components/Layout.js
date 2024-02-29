import Head from "next/head";
import Header from "../components/Header";
import { useState } from "react";
import Link from "next/link";
export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const closeNav = () => {
    setOpen(false);
  };
  const openNav = () => {
    setOpen(true);
  };
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <title>Pullman Bus</title>
      </Head>

      <Header openNav={openNav} />

      <main>{children}</main>
      <div id="myNav" className={"overlay " + (open ? "open" : "")}>
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
              <Link href="/cevolucion" legacyBehavior>
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
            {/* <div className="w-100"><a href="#" className="ofertas">Ofertas</a></div> */}
            {/* <div className="w-100"><Link href="/confirmacion-boleto"legacyBehavior  ><a href="/confirmacion-boleto" className="conf-pasajes">Confirmación de pasajes</a></Link></div> */}
            <div className="w-100">
              <Link href="/teAyudamos" legacyBehavior>
                <a className="ayuda">
                  Te ayudamos
                </a>
              </Link>
            </div>
          </div>
          <div className="w-100">
            <div className="contactanos-menu">
              <span>Síguenos :</span>
              <div className="col-6 pt-8 d-flex justify-content-around">
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
        </div>
      </div>
    </>
  );
}
