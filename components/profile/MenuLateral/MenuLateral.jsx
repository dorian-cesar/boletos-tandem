import axios from "axios";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useForm } from "/hooks/useForm";
import { useEffect, useState, forwardRef, useRef, useMemo } from "react";
import styles from "./MenuLateral.module.css";

const MenuLateral = (props) => {
  const { vista , setVista , setNombreVista } = props;
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    async function buscarMenu() {
      try {
        const data = await axios.post("/api/user/obtener-menu", "");
        if (data.data.status) {  
          setMenu(data.data.object);
        }
      } catch ({ message }) {
        console.error(`Error al obtener menú [${message}]`);
      }
    }

    buscarMenu();
  }, []);

  const cambiarVista = (nuevaVista, nombreMenu) => {
    setVista(nuevaVista);
    setNombreVista(nombreMenu);
  };

  return (
    <>
      <div className={ `${styles["menu-lateral"]} "col-12 col-md-2"`}>
      {menu.map((opcion) => (
        
        <div key={opcion.idMenu} className={ `${styles["item-menu-lateral"]} "row"`} onClick={() => cambiarVista(opcion.opcionMenu, opcion.nombreMenu)}>
          <div className="col-10">
            <a className={styles[opcion.classname]}>{opcion.nombreMenu}</a>
          </div>
          <div className={"col-2"}>
            <img
              src="../img/icon/profile/chevron-forward-circle-outline.svg"
              alt=""
            />
          </div>
        </div>
      ))}
      </div>
    </>
  );
};

export default MenuLateral;
