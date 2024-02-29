import axios from "axios";
import DatePicker, { registerLocale } from "react-datepicker";
import Layout from "../Layout";
import { useEffect, useState, forwardRef, useRef, useMemo } from "react";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useForm } from "/hooks/useForm";
import Head from "next/head";
import Input from "../Input";

const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <input
    type="text"
    className="fecha-input-modal form-control form-control-modal"
    onClick={onClick}
    ref={ref}
    value={value}
    onChange={() => {}}
  />
));

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

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
  const [isLoading2, setIsLoading2] = useState(false);
  const [alerta, setAlerta] = useState({
    msg: "",
    visible: false,
    type: "",
  });

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

  const listaYears = useMemo(() => {
    let years = [];
    for (let i = new Date().getFullYear(); i >= 1910; i--) {
      years.push(i);
    }
    return years;
  }, []);

  const HistorialCompra = async () => {
    const formStatus = await validarForm();
    if (formStatus) {
      setIsLoading2(true);
      const res = await axios.post("../api/user/actualizar-datos-perfil", {
        ...data,
      });
      if (res.data.status) {
        setIsLoading2(false);
        setAlerta({
          visible: true,
          msg: res.data.message,
          type: "alert-success",
        });
        setTimeout(() => {
          setAlerta({ visible: false, msg: "", type: "" });
        }, 5000);
      }
      setIsLoading2(false);
    }
  };

  const validarForm = () => {
    return new Promise((resolve, reject) => {
      const values = Object.values(data);
      const camposVacios = values.filter((v) => v == "");
      if (camposVacios.length > 0) {
        setAlerta({
          visible: true,
          msg: "Se requiere rellenar todos los campos.",
          type: "alert-danger",
        });
        resolve(false);
      } else {
        if (data?.correo != data?.correo2) {
          setAlerta({
            visible: true,
            msg: "Los correos no coinciden. Por favor, verificar.",
            type: "alert-danger",
          });
          resolve(false);
        } else {
          setAlerta({ visible: false, msg: "", type: "" });
          resolve(true);
        }
      }
    });
  };

  return (
    <>
      <div className="col-12 col-md-6 ">
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
      </div>
    </>
  );
};

export default HistorialCompra;
