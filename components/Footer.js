import Link from "next/link";
import Image from "next/image";

const Footer = () => (
  <>
    <footer className="psjes">
      <div className="container">
        <div className="row">
          <div className="col-md-3 col-sm-6">
            <h3>
              <img
                className="mr-2 img-contacto-footer"
                src="../img/icon/chat/location-outline.svg"
                alt=""
              />
              Contacto
            </h3>
            <div
              className="w-100"
              style={{ paddingLeft: "25px", borderLeft: "1px solid" }}
            >
              <p>
                San Borja 235 , Estación Central, <br />
                Santiago
              </p>
              <a href="mailto:clientes@pullmanbus.cl">clientes@pullmanbus.cl</a>
              {/* <p>
                                <b>Call Center 600 600 0018</b>
                            </p> */}
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <h3>
              <img
                className="mr-2"
                src="../img/icon/chat/chatbox-ellipses-outline.svg"
                alt=""
              />
              Información
            </h3>
            <div
              className="w-100"
              style={{ paddingLeft: "25px", borderLeft: "1px solid" }}
            >
              <ul>
                {/* <li>
                                    <Link href="/teAyudamos?page=preguntas" legacyBehavior>
                                        <a href="">Preguntas Frecuentes</a>
                                    </Link>
                                </li> */}
                <li>
                  <Link href="/conoce-tus-derechos" legacyBehavior>
                    <a href="/conoce-tus-derechos">Conoce tus derechos</a>
                  </Link>
                </li>
                <li>
                  <Link href="/politica-de-privacidad" legacyBehavior>
                    <a href="/politica-de-privacidad">Política de privacidad</a>
                  </Link>
                </li>
                <li>
                  <Link href="/terminos" legacyBehavior>
                    <a href="/terminos">Términos y condiciones de pasajes</a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 ps-4 pe-0 pt-4">
            <div className="d-flex justify-content-center justify-content-sm-center">
              <a
                className="pe-4"
                target="_blank"
                href="https://www.facebook.com/tandemindustrial.cl/"
              >
                <img src="../img/icon/chat/logo-facebook.svg" alt="" />
              </a>
              <a
                className="pe-4"
                target="_blank"
                href="https://www.instagram.com/tandem.industrial/"
              >
                <img src="../img/icon/chat/logo-instagram.svg" alt="" />
              </a>
              <a
                className="pe-4"
                target="_blank"
                href="https://www.linkedin.com/company/tandem-industrial/"
              >
                <img src="../img/icon/chat/logo-linkedin.svg" alt="" />
              </a>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 ps-0 pe-0">
            <div className="d-flex flex-column align-items-center align-items-sm-start text-center text-sm-start">
              <Image
                src="/img/icon/chat/Group.svg"
                alt="Ícono de chat"
                width={150}
                height={100}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  </>
);

export default Footer;
