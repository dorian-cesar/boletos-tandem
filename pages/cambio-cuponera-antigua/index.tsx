import styles from './cambio-cuponera-antigua.module.css';

import Footer from "components/Footer";
import Layout from "components/Layout";

export default function CambioCuponeraAntigua() {
    return (
        <Layout>
            <main className="container my-4">
                <h6>{ "Inicio > Cambio de cuponera antigua" }</h6>
                <section className={ styles["contenedor-formulario"] }>
                    <h4>Cambio de cuponera antigua</h4>
                    <span>
                        Ingresa el código de tu cuponera antigua y el correo al cual deseas que lleguen los nuevos boletos en blanco. 
                        Esto solo puede ser realizado <strong>una vez por cuponera</strong> y es valido solo para cuponeras compradas con sistema antiguo Pullman Bus.
                    </span>
                    <strong>Este formulario dejará de operar el 31/05/2024 a las 23:59.</strong>
                    <section className={ `${styles["contenedor-inputs"]} row` }>
                        <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xxl-4 px-2">
                            <label htmlFor="codigoCuponeraAntigua" className="form-label fw-normal">Código de Cuponera antigua</label>
                            <input type="email" className="form-control" id="codigoCuponeraAntigua"/>
                        </div>
                        <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xxl-4 px-2">
                            <label htmlFor="correoElectronico" className="form-label fw-normal">Correo electrónico</label>
                            <input type="email" className="form-control" id="correoElectronico" placeholder="correo@ejemplo.com"/>
                        </div>
                        <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xxl-4 px-2">
                            <label htmlFor="confirmacionCorreoElectronico" className="form-label fw-normal">Confirmación de correo electrónico</label>
                            <input type="email" className="form-control" id="confirmacionCorreoElectronico" placeholder="correo@ejemplo.com"/>
                        </div>
                        <div className={ `col-12 ${ styles["contenedor-boton"] }`}>
                            <button>Continuar</button>
                        </div>
                    </section>
                </section>
            </main>
            <Footer />
        </Layout>
    )
}