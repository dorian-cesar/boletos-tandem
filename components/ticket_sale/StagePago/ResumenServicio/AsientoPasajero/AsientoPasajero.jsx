import { useSelector, useDispatch } from "react-redux";
import styles from "./AsientoPasajero.module.css";
import Rut from "rutjs";
import { useEffect, useState } from "react";
import Acordeon from "../../../../Acordeon/Acordeon";
import DatosPasajero from "../DatosPasajero/DatosPasajero";

const AsientoPasajero = (props) => {
  const { data } = props;
  return (
    <>
      {Object.entries(data).map(([key, value]) => {
        const title = "Pasajero asiento " + value.asiento;
        return (
          <Acordeon key={key} title={title} children={<DatosPasajero />} />
        );
      })}
    </>
  );
};

export default AsientoPasajero;
