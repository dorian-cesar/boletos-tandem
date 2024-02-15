import styles from "./PuntoEmbarque.module.css"

const PuntoEmbarque = (props) => {
  return (
    <>
      <div className={styles["container"]}>
        <div className={styles["dotted-line"]}>
            ponga sus embarque aqui, falta servicio 
        </div>
      </div>
    </>
  );
};

export default PuntoEmbarque;
