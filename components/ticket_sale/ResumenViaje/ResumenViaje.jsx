import React from 'react'
import styles from './ResumenViaje.module.css';
import { useDispatch, useSelector } from 'react-redux';

export const ResumenViaje = () => {

    const carroCompras = useSelector((state) => state.compra?.listaCarrito) || [];
    const dispatch = useDispatch();

    function agruparInformacion() {
        const servicios = {};
        /*
            FALTA:
            - Origen - destino (Nombre de ciudad)
            - ¿Como se va a agrupar el carro de compras? ¿Por origen-destino? ¿Por servicio? 
            ¿Que pasa si tengo 2 servicios iguales pero distinta fecha u horario?
            - ¿Que pasa si tengo 2 servicios iguales pero distinta cantidad de pasajes? como se muestra la informacion de llenado del pasajero
            - Ahora con el carro de compras, como verifico si alguno es ida y vuelta? no sera mejor dejar solo servicio y eliminar ida y vuelta para pago?
        */
        carroCompras.forEach(carro => {
            if( servicios[`${ carro.servicio.idTerminalOrigen }-${ carro.servicio.idTerminalDestino }`] ) {
                servicios[`${ carro.servicio.idTerminalOrigen }-${ carro.servicio.idTerminalDestino }`].push(carro);
            } else {
                servicios[`${ carro.servicio.idTerminalOrigen }-${ carro.servicio.idTerminalDestino }`] = [carro];
            }
        });
    }

    return (
        <div className={ styles['resumen-container'] }>
            <h3>Resumen del viaje</h3>
            <div className={ styles['contenedor-servicios'] }>
                <div className={ styles['servicio-ida'] }>
                </div>
                <div className={ styles['servicio-vuelta'] }>
                </div>
            </div>
        </div>
    )
}
