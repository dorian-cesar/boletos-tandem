import { useSelector, useDispatch } from "react-redux";
import styles from "./InformacionPasajero.module.css"
import Rut from "rutjs";
import { useEffect, useState } from "react";
import Acordeon from "../../../../Acordeon/Acordeon";
import DatosPasajero from "../DatosPasajero/DatosPasajero";



const InformacionPasajero = (props) => {
    const { asiento, title, servicio } = props;
    return (
        <>
            <Acordeon title={ title }>
                <DatosPasajero asiento={ asiento } servicio={ servicio } />
            </Acordeon> 
        </>
    )
}

export  default InformacionPasajero;