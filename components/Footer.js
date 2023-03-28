import Link from "next/link";

const Footer = () => (
    <>
        <footer className="psjes">
            <div className="container">
                <div className="row">
                    <div className="col-4">
                        <h3>
                            <img className="mr-2 img-contacto-footer" src="/img/icon-ubi.svg" alt=""/>
                            Contacto
                        </h3>
                        <div className="w-100" style={{ paddingLeft: "25px", borderLeft: "1px solid" }}>
                            <p>San Borja 235 , Estación Central, Santiago</p>
                            <a href="mailto:clientes@pullmanbus.cl">
                                clientes@pullmanbus.cl
                            </a>
                            <h4>
                                Call Center <br />
                                600 600 0018
                            </h4>
                        </div>
                    </div>
                    <div className="col-3">
                        <h3>
                            <img className="mr-2" src="/img/icon-info.svg" alt=""/>
                            Información
                        </h3>
                        <div className="w-100" style={{ paddingLeft: "25px", borderLeft: "1px solid" }}>
                            <ul>
                                <li>
                                    <a href="">Preguntas Frecuentes</a>
                                </li>
                                <li>
                                    <Link href="/conoce-tus-derechos" legacyBehavior>
                                        <a href="/conoce-tus-derechos">
                                            Conoce tus derechos
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/politica-de-privacidad" legacyBehavior>
                                        <a href="/politica-de-privacidad">
                                            Política de privacidad
                                        </a>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terminos" legacyBehavior>
                                        <a href="/terminos">
                                            Termino y condiciones de pasajes
                                        </a>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-2 pt-4">
						<a target="_blank" href="https://www.facebook.com/Pullman.cl/">
                        	<img src="/img/icon-fb-blanco.svg" className="mr-2" alt=""/>
						</a>
						<a target="_blank" href="https://www.instagram.com/pullmanbus/">
                        	<img src="/img/icon-ig-blanco.svg" className="mr-2" alt=""/>
						</a>
						<a target="_blank" href="https://www.linkedin.com/company/pullman-bus/">
                        	<img src="/img/icon-in-blanco.svg" className="mr-2" alt=""/>
						</a>
                    </div>
                    <div className="col-3">
                        <img src="/img/webpay.svg" className="img-fluid" alt=""/>
                    </div>
                </div>
            </div>
        </footer>
    </>
);

export default Footer;