import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useForm } from "/hooks/useForm";
import styles from './HistorialCompra.module.css';
import axios from "axios";
import { useId } from "react";
import { decryptData } from "utils/encrypt-data.js";
import LocalStorageEntities from "entities/LocalStorageEntities";

const actualizarFormFields = {
  rut: "",
  apellidoMaterno: "",
  apellidoPaterno: "",
  correo: "",
  correo2: "",
  fechaNacimiento: "",
  nombres: "",
  tipoDocumento: "R",
  sexo: "",
};

const estadoBoleto = {
  'ACTI': 'Activo',
  'NUL': 'Nulo'
}

const clpFormat = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

const HistorialCompra = () => {
  const { formState: data, onInputChange } = useForm(actualizarFormFields);
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const router = useRouter();
  const { getItem } = useLocalStorage();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [historial, setHistorial] = useState([]);

  const id = useId();

  useEffect(() => {
    let checkUser = decryptData(LocalStorageEntities.user_auth);
    if (checkUser == null) router.push("/");
    setUser(checkUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    data.nombres = user?.nombres;
    data.apellidoPaterno = user?.apellidoPaterno;
    data.apellidoMaterno = user?.apellidoMaterno;
    data.sexo = user?.sexo;
    data.mail = user?.mail;
    data.mail = user?.mail;
    data.rut = user?.rut;
    if (!!user?.fechaNacimiento) {
      let fecha = new Date(
        String(user?.fechaNacimiento).substring(
          0,
          String(user?.fechaNacimiento).length - 5
        )
      );
      setFechaNacimiento(fecha);
    }
  }, [user]);

  useEffect(() => {
    data.fechaNacimiento = fechaNacimiento;
  }, [fechaNacimiento]);

  useEffect(() => {
    if( user ) {
      axios.post("/api/user/historial-compra", {
        email: user.mail,
      }).then(({ data }) => {
        console.log(data.object);
        setHistorial(data.object);
      }).catch((error) => console.log('ERROR:::', error));
    }
  }, [user])

  const MemoizedComponent = useMemo(function renderHistorial() {
    if( historial.length === 0 ) {
      return (<h3>No hay registros</h3>)
    } else {
      const renderedComponent = [];

      historial.map((itemHistorial, index) => {
        renderedComponent.push(
          <tr>
            <td>{ itemHistorial.codigo }</td>
            <td>{ itemHistorial.fechaCompraFormato }</td>
            <td>{ clpFormat.format(itemHistorial.monto) }</td>
            <td>{ estadoBoleto[itemHistorial.estado] }</td>
            <td className={ styles['boton-descargar']}>
              { itemHistorial.estado === 'ACTI' && (
                <a href={ `/generarBoletos/${ itemHistorial.codigo }` } target="_blank">
                  <img src='/img/icon/general/download-outline.svg' />
                </a>
              )}
            </td>
          </tr>
        )
      });

      // historial.map((itemHistorial, index) => {
      //   renderedComponent.push(
      //     <div key={ `${ id }-${ index }` } className={ styles['boleto'] }>
      //       <div className={ styles['origen-destino'] }>
      //         <span>[ORIGEN]</span>
      //         <span>[DESTINO]</span>
      //       </div>
      //       <div className={ styles['linea-divisora'] }>
      //         <img src="/img/icon-barra.svg" />
      //       </div>
      //       <div className={ styles['informacion-adicional'] }>
      //         <div className={ styles['estado'] }>
      //           <h5>Estado: </h5>
      //           <strong>{ estadoBoleto[itemHistorial.estado] }</strong>
      //         </div>
      //         <div className={ styles['monto'] }>
      //           <span>{ itemHistorial.monto }</span>
      //         </div>
      //         {/* <div className={ styles['asientos'] }>

      //         </div> */}
      //       </div>
      //     </div>
      //   )
      // });

      return renderedComponent;
    }
  }, [historial]);

  return (
    <>
      <div className={ styles['menu-central'] }>
        <h1>Historial de compras</h1>
        <span>
          Mantén un registro de todos los viajes realizados. Recuerda
          que solo podrás descargar tu pasaje mientras esté activo.
        </span>
        <table className={`table ${ styles['tabla-informacion'] }`}>
          <thead>
            <tr>
              <th scope="col">Transacción</th>
              <th scope="col">Fecha Transacción</th>
              <th scope="col">Monto</th>
              <th scope="col">Estado</th>
              <th scope="col">Descargar Boletos</th>
            </tr>
          </thead>
          <tbody>
            {
              !isLoading ? MemoizedComponent : ''
            }
          </tbody>
        </table>
        <section className={ styles['contenedor-historial'] }>
        </section>
      </div>
    </>
  );
};

export default HistorialCompra;
