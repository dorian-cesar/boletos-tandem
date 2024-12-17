import { useSelector, useDispatch } from "react-redux";
import styles from "./InformacionPasajero.module.css"
import Rut from "rutjs";
import { useEffect, useState } from "react";
import Acordeon from "../../../../Acordeon/Acordeon";
import DatosPasajero from "../DatosPasajero/DatosPasajero";



const InformacionPasajero = (props) => {
    const { asiento, title, servicio, nacionalidades } = props;
    return (
        <>
            <Acordeon title={ title } open={ true }>
                <DatosPasajero asiento={ asiento } servicio={ servicio } pasajero={ true } nacionalidades={ nacionalidades } />
            </Acordeon> 
        </>
    )
}

export  default InformacionPasajero;