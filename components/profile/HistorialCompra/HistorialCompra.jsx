import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useForm } from "/hooks/useForm";
import styles from './HistorialCompra.module.css';
import axios from "axios";
import { useId } from "react";


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
    let checkUser = getItem("user");
    if (checkUser == null) router.push("/");
    setUser(checkUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    data.nombres = user?.nombres;
    data.apellidoPaterno = user?.apellidoPaterno;
    data.apellidoMaterno = user?.apellidoMaterno;
    data.sexo = user?.sexo;
    data.correo = user?.correo;
    data.correo2 = user?.correo;
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
        email: user.correo,
      }).then(({ data }) => {
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
          <div key={ `${ id }-${ index }` }>
              { itemHistorial.estado }
              { itemHistorial.monto }
          </div>
        )
      });

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
        {
          !isLoading ? MemoizedComponent : ''
        }
      </div>
      {/* <div className="col-12 col-md-6 ">
        <div className="menu-central">
          <div className="col-12 col-md-12 bloque">
            <h1 className="titulo-modificar-datos">Historial de compra</h1>
            <div className="row ">
              <div className="col-12">
                <label className="label-input-modal">
                  Mantén un registro de todos los viajes realizados. Recuerda
                  que solo podrás descargar tu pasaje mientras esté activo.
                </label>
              </div>
            </div>
            <div className="row ">
              <div className="col-4"></div>
              <div className="col-4"></div>
              <div className="col-4">
                <Input className="sel-input origen" placeholder="Estado" />
              </div>
            </div>
            <div className="row">
              <div className="row container-historial">
                <div className="row col-12">
                  <div className="col-3 ">
                    <label className="label-input-modal">Arica</label>
                  </div>
                  <div className="col-3 ">
                    <label className="label-input-modal"></label>
                  </div>
                  <div className="col-3 ">
                    <label className="label-input-modal">Hora</label>
                  </div>
                </div>
                <div className="row col-12">
                  <div className="col-3 ">
                    <label className="label-input-modal">..........................................................................................................................................</label>
                  </div>
                  <div className="col-3 ">
                    <label className="label-input-modal"></label>
                  </div>
                  <div className="col-3 ">
                    <label className="label-input-modal"></label>
                  </div>
                </div>
                <div className="row col-12">
                  <div className="col-3 ">
                    <label className="label-input-modal">Estado</label>
                  </div>
                  <div className="col-3 ">
                    <label className="label-input-modal">$53.300</label>
                  </div>
                  <div className="col-3 ">
                    <label className="label-input-modal">N° asiento</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default HistorialCompra;
