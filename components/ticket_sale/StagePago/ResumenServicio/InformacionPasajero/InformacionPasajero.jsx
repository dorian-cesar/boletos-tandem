import { useSelector, useDispatch } from "react-redux";
import styles from "./InformacionPasajero.module.css"
import Rut from "rutjs";
import { useEffect, useState } from "react";
import Acordeon from "../../../../Acordeon/Acordeon";
import AsientoPasajero from "../AsientoPasajero/AsientoPasajero";



const InformacionPasajero = (props) => {
    const { data } = props;
    return (
        <>
        {Object.entries(data).map(([key, value]) => {
                const title = (value.terminalOrigen +" - "+ value.terminalDestino +" - "+ value.horaSalida);
                return (
                    <Acordeon key={key} title={title} children={<AsientoPasajero data={value.asientos}/>}/> 
                );
            })}
         
        
        </>
    )
}

export  default InformacionPasajero;