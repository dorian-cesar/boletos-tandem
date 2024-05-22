import { useState } from 'react';
import styles from './cambio-cuponera-antigua.module.css';

import Footer from "components/Footer";
import Layout from "components/Layout";

import { ToastContainer, toast } from "react-toastify";

type Form = {
    codigoCuponera: string;
    correoElectronico: string;
    confirmacionCorreoElectronico: string;
}

export default function CambioCuponeraAntigua() {
    const [isSended, setIsSended] = useState<boolean>(false);

    const [form, setForm] = useState<Form>({
        codigoCuponera: '',
        correoElectronico: '',
        confirmacionCorreoElectronico: ''
    });
    
    function handleSubmit(event: any) {
        event.preventDefault();

        if( form.codigoCuponera === '' || form.correoElectronico === '' || form.confirmacionCorreoElectronico === '' ) {
            toast.error('Debe ingresar todos los datos para solicitar sus boletos', {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
            });
            return;
        }

        if( form.correoElectronico !== form.confirmacionCorreoElectronico ) {
            toast.error('Los correos electronicos ingresados deben ser iguales', {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
            });
            return;
        }

        setIsSended(true);
    }

    function handleSetValues(event: any) {
        let formValues:any = { ...form }
        formValues[event.target.name] = event.target.value;
        setForm(formValues);
    }

    return (
        <Layout>
            <main className="container my-4">
                <h6>{ "Inicio > Cambio de cuponera antigua" }</h6>
                <section className={ styles["contenedor-formulario"] }>
                    { 
                        !isSended ? (
                            <>
                                <h4>Cambio de cuponera antigua</h4>
                                <span>
                                    Ingresa el código de tu cuponera antigua y el correo al cual deseas que lleguen los nuevos boletos en blanco. 
                                    Esto solo puede ser realizado <strong>una vez por cuponera</strong> y es valido solo para cuponeras compradas con sistema antiguo Pullman Bus.
                                </span>
                                <strong>Este formulario dejará de operar el 31/05/2024 a las 23:59.</strong>
                                <form onSubmit={ handleSubmit }>
                                    <section className={ `${styles["contenedor-inputs"]} row` }>
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xxl-4 px-2">
                                            <label htmlFor="codigoCuponera" className="form-label fw-normal">Código de Cuponera antigua</label>
                                            <input type="email" className="form-control" id="codigoCuponera" name="codigoCuponera" value={form.codigoCuponera} onChange={handleSetValues}/>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xxl-4 px-2">
                                            <label htmlFor="correoElectronico" className="form-label fw-normal">Correo electrónico</label>
                                            <input type="email" className="form-control" id="correoElectronico" name="correoElectronico" placeholder="correo@ejemplo.com" value={form.correoElectronico} onChange={handleSetValues}/>
                                        </div>
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xxl-4 px-2">
                                            <label htmlFor="confirmacionCorreoElectronico" className="form-label fw-normal">Confirmación de correo electrónico</label>
                                            <input type="email" className="form-control" id="confirmacionCorreoElectronico" name="confirmacionCorreoElectronico" placeholder="correo@ejemplo.com" value={form.confirmacionCorreoElectronico} onChange={handleSetValues}/>
                                        </div>
                                        <div className={ `col-12 ${ styles["contenedor-boton"] }`}>
                                            <button type='submit'>Continuar</button>
                                        </div>
                                    </section>
                                </form>
                            </>
                        ) : (
                            <>
                                <span className={ `mx-auto ${ styles["check"] }` }>👍</span>
                                <section className="mx-auto p-3">
                                    <p className='fs-2 fw-normal text-center'>
                                        Su(s) boleto(s) en blanco ya fueron enviados al correo XXXX@XXXX.XX. <br/>
                                        Recuerde confirmar su(s) boleto(s) en blanco en la sección "Confirmación" del menú.
                                    </p>
                                </section>
                            </>
                        )
                    }
                </section>
            </main>
            <ToastContainer />
            <Footer />
        </Layout>
    )
}