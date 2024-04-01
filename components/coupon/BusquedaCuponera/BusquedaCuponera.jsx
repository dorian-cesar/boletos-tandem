import axios from "axios";
import dayjs from "dayjs";
import DatePicker, { registerLocale } from "react-datepicker";
import Link from "next/link";
import Input from "../Input";
import { useEffect, useState, forwardRef } from "react";
import es from "date-fns/locale/es";
import styles from "./BusquedaCuponera.module.css";
import { ObtenerParrillaCuponeraServicioDTO } from "dto/ParrillaDTO";

registerLocale("es", es);

const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <input
    type="text"
    className="fecha-input form-control"
    onClick={onClick}
    ref={ref}
    defaultValue={value}
    readOnly={true}
  />
));

const BusquedaCuponera = (props) => {
  const { parrilla, setParrilla, setLoadingParrilla } = props;

  const { origenes, dias, isShowMascota = false } = props;
  const [mascota_allowed, setMascota] = useState(false);
  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);
  const [destinos, setDestinos] = useState([]);

  async function searchParrillaCuponera() {
    debugger;
    try {
        setLoadingParrilla(true);
        const parrillaCuponera = await axios.post("/api/coupon/parrilla-cuponera", new ObtenerParrillaCuponeraServicioDTO(origen, destino));
        setParrilla(parrillaCuponera.data.object.map((parrillaMapped, index) => {
            return {
                ...parrillaMapped,
                id: index + 1
            }
        }));
        setLoadingParrilla(false);   
    } catch ({ message }) {
      console.error(`Error al obtener parrilla [${message}]`);
    }
  }

  async function getDestinos() {
    if (origen !== null) {
      try {
        let { data } = await axios.post("/api/destinos", {
          id_ciudad: origen,
        });
        setDestinos(data);
      } catch ({ message }) {
        console.error(`Error al obtener destinos [${message}]`);
      }
    }
  }

  function retornaCiudadesSelect(arrayCiudades) {
    return arrayCiudades.map((ciudad) => {
      return {
        value: ciudad?.codigo,
        label: ciudad?.nombre,
      };
    });
  }

  function cambiarOrigen(origenSeleccionado) {
    setDestino(null);
    setOrigen(origenSeleccionado);
  }

  useEffect(() => {
    (async () => await getDestinos())();
  }, [origen]);

  return (
    <>
      <div className={styles["container"]}>
        <div className="search-row">
          <div className="">
            <div className={styles["grupo-campos"]}>
              <label>Origen</label>
              <Input
                className="sel-input origen"
                placeholder="Seleccione origen"
                items={retornaCiudadesSelect(origenes)}
                selected={
                  origen &&
                  retornaCiudadesSelect([
                    origenes.find((i) => i.codigo == origen),
                  ])
                }
                setSelected={cambiarOrigen}
              />
            </div>
          </div>

          <div className="">
            <div className={styles["grupo-campos"]}>
              <label>Destino</label>
              <Input
                className="sel-input destino"
                placeholder="Seleccione destino"
                items={retornaCiudadesSelect([
                  ...destinos,
                  {
                    codigo: "NO_OPTIONS",
                    nombre: "Por favor seleccione un origen",
                  },
                ])}
                selected={
                  destino &&
                  destinos.length > 0 &&
                  retornaCiudadesSelect([
                    destinos.find((i) => i.codigo == destino),
                  ])
                }
                setSelected={setDestino}
              />
            </div>
          </div>
          <div className="">
            <div className={styles["grupo-campos"]}>
              <div
                className={
                  origen && destino
                    ? styles["button-search-coupon"]
                    : styles["button-search-coupon-disabled"]
                }
                onClick={origen && destino && searchParrillaCuponera}
              >
                <img src="../img/icon/cuponera/search-outline.svg" /> Buscar
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BusquedaCuponera;
