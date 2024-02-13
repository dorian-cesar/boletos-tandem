import styles from "./MedioPago.module.css"
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { agregarMedioPago } from "../../../../store/usuario/compra-cuponera-slice"

const MedioPago = () => {
    const dispatch = useDispatch()

    const [carro, setCarro] = useState({
        datos: { },
    });

    function setDataMedioPago({ name, value }) {
        try {
                let carro_temp = { ...carro };
                carro_temp.datos[name] = value;
                dispatch(agregarMedioPago(carro_temp.datos))
                setCarro(carro_temp);
            } catch ({ message }) {
                console.error(`Error al agregar informacion del comprador [${ message }]`);
            }
        };

    return (
        <>
        <div className={styles["container"]}>
            <div className={styles["dotted-line"]}></div>
            <div className={'col-12 col-md-6'}>
                    <div className={'row'}>
                        <div className={'col'}>
                            <label className={styles['contenedor']}>                       
                                <input 
                                    type='checkbox'
                                    checked={ carro.datos['tipoMedioPago'] === 'WBPAY' ? 'checked' : '' }
                                    value='WBPAY'
                                    name='tipoMedioPago'
                                    onChange={ (e) => setDataMedioPago(e.target) } />
                                <span className={styles['checkmark']}></span>
                            </label>
                        </div>
                        <div className={'col'}>
                        <img src="../img/icon/cuponera/Logo-webpay.svg" /> 
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MedioPago;