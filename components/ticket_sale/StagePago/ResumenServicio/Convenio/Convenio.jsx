import { useEffect, useState } from "react";
import styles from "./Convenio.module.css";
import axios from "axios";
import Rut from "rutjs";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { agregarMedioPago } from 'store/usuario/compra-slice';

const Convenio = (props) => {
  const { convenioActivos, descuentoConvenio, setDescuentoConvenio , convenio, setConvenio, requestConvenio, setRequestConvenio} = props;
  const [convenioFields, setConvenioFields] = useState({});
  const [atributoConvenio, setAtributoConvenio] = useState([]);
  const dispatch = useDispatch();

  const handleRadioChange = async (id) => {
    debugger;
    setDescuentoConvenio(null);
    try {
      let request = {
        convenio: id,
      };
      const convenio_response = await axios.post(
        "/api/convenio/obtener-detalle-convenio",
        request
      );
      dispatch(agregarMedioPago({ medioPago: null }));
      setAtributoConvenio(convenio_response.data);
    } catch ({ message }) {
      console.error(`Error al obtener convenio [${message}]`);
    }
    setConvenio(id);
  };

  function retornarFormularioConvenio() {
    const formularioConvenio = atributoConvenio.map(
        (formularioConvenio, indexFormularioConvenio) => (
          <div
            key={`frm-convenio-key-${indexFormularioConvenio}`}
            className="grupo-campos mt-1"
          >
            <label>{formularioConvenio.tipo}</label>
            <input
              value={convenioFields[formularioConvenio.tipo] || ''}
              type={formularioConvenio.tipoInput}
              name={formularioConvenio.tipo}
              className="form-control"
              onChange={(e) => setDataConvenio(e.target)}
            />
          </div>
        )
      );
    return (
      <>
        {formularioConvenio}
        <a
          className="btn"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            validarConvenio();
          }}
        >
          Validar Convenio
        </a>
      </>
    );
  }

  const validarConvenio = async () =>{
    try{

        let request = {
            idConvenio: convenio,
            atributo: convenioFields.RUT
          };
          setRequestConvenio(request);
          const convenio_response = await axios.post(
            "/api/convenio/validar-convenio",
            request
          );

          if(convenio_response.data?.afiliado){
            if(convenio==='COPEC'){
                toast.info("Rut valido para convenio", {
                  position: "top-center",
                  autoClose: 3000,
                  hideProgressBar: false,
                });
              setDescuentoConvenio({id: convenio, ...convenio_response.data});
            return;
            }
            toast.info("Descuento aplicado", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
              });
            setDescuentoConvenio({id: convenio, ...convenio_response.data});
          }else{
            toast.error("Rut no valido para descuento", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
              });
          }

    } catch ({ message }) {
        console.error(`Error al validar convenio[${message}]`);
    }
  }

  function validarFormatoRut(name, value) {
    try {
      if (name.trim() == "RUT" && value.length > 2) {
        let rut = new Rut(value);
        value = new Rut(rut.getCleanRut().replace("-", "")).getNiceRut(true);
      }
      return value;
    } catch ({ message }) {
      console.error(`Error al validar formato de rut [${message}]`);
    }
  }

  const setDataConvenio = ({ name, value }) => {
    try {
       
      if (name === "RUT" && value !== "") {
        value = validarFormatoRut(name, value);
        value = value.replace(/[^\dkK0-9.-]/g, "");          
        if (value.length > 12) return;
      }
    
      setConvenioFields((prevFields) => ({
        ...prevFields,
        [name]: value,
      }));

    } catch ({ message }) {
      console.error(`Error al agregar información del comprador [${message}]`);
    }
  };

  return (
    <>
      <div className={styles["container"]}>
        {convenioActivos
          .filter((element) => element.convenio !== "WBPAY")
          .map((element) => (
            <div key={element.convenio} className={styles["body-pay"]} onClick={ () => handleRadioChange(element.convenio) }>
              <input
                type="radio"
                id={element.convenio}
                name="convenio"
                value={element.convenio}
                className="d-none"
              />
              <div>
              {element.rutaImagen && (
                  <img src={element.rutaImagen} alt="logo" className={styles["logo"]} />
                )}
                <label
                  style={{ color: element.primaryColor }}
                  className={styles["text-coupon"]}
                  htmlFor={element.convenio}
                >
                  {element?.descripcion}
                </label>
              </div>
              {convenio === element.convenio &&  atributoConvenio.length > 0 && (
                <div>{retornarFormularioConvenio()} </div>
              )}
            </div>
          ))}
      </div>
    </>
  );
};

export default Convenio;
