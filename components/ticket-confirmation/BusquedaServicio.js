import axios from "axios";
import dayjs from "dayjs";
import DatePicker, { registerLocale } from "react-datepicker";
import Link from "next/link";
import Input from "../../components/Input";
import { useEffect, useState, forwardRef } from "react";
import es from "date-fns/locale/es";
import { limpiarListaCarrito } from "store/usuario/compra-slice"
import { useDispatch, useSelector } from "react-redux";

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

const BusquedaServicio = (props) => {
  const {
    origenes,
    dias,
    isShowMascota = false,
    setParrilla,
    setLoadingParrilla,
    boletoValido,
    buscaAlIniciar
  } = props;
  const [mascota_allowed, setMascota] = useState(false);
  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);
  const [destinos, setDestinos] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().toDate());
  const [datePickerKey, setDatePickerKey] = useState(0);

  const carroCompras = useSelector((state) => state.compra?.listaCarrito) || [];

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

  async function isValidStart(date) {
    return (
      dayjs(date).isAfter(dayjs().subtract(1, "day")) &&
      dayjs(date).isBefore(dayjs().add(dias, "day"))
    );
  }

  async function isValidAfter(date) {
    return (
      dayjs(date).isAfter(dayjs(startDate).subtract(1, "day")) &&
      dayjs(date).isBefore(dayjs().add(dias, "day"))
    );
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

  /*
  useEffect(() => {
    if (boletoValido && boletoValido.fechaEmbarcacion) {
      const formattedDate = dayjs(boletoValido.fechaEmbarcacion, 'DD/MM/YYYY').toDate();
      setStartDate(formattedDate);
    }
  }, [boletoValido]);
*/
  /*
  useEffect(() => {
    if (boletoValido) {
      setStartDate(dayjs(boletoValido.fechaEmbarcacion, "DD/MM/YYYY").toDate());
      setOrigen(boletoValido.idOrigenServicio);
      setDestino(boletoValido.idDestinoServicio);
    }
  }, [boletoValido]);
*/
  async function searchParrilla() {
    debugger;
    try {
      if(carroCompras.length > 0) {
          useDispatch(limpiarListaCarrito());
      }
      
      setLoadingParrilla(true);

      let data = {
        origen: origen,
        destino: destino,
        startDate: dayjs(startDate).format("YYYYMMDD"),
      };

      const parrilla = await axios.post("/api/parrilla", data
      );
      console.log('Planilla de asientos', parrilla )
      setParrilla(parrilla.data.map((parrillaMapped, index) => {
          return {
              ...parrillaMapped,
              id: index + 1
          }
      }));
      setLoadingParrilla(false);   
    } catch ({ message }) {
        console.error(`Error al obtener parrilla [${ message }]`)
    }
  };

  useEffect(() => {
    if ( buscaAlIniciar ) {
      searchParrilla();
    }
  }, [destino]);

  return (
    <div className="col-12 col-md-12">
      <div className="bloque">
        <div className="row">
          <div className="col-12 col-md-3">
            <div className="grupo-campos">
              <label className="label-input">¿De dónde viajamos?</label>
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
                isDisabled={true}
              />
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="grupo-campos">
              <label className="label-input">¿A dónde viajamos?</label>
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
                isDisabled={true}
              />
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="grupo-campos mb-4">
              <label className="label-input">¿Cuándo viajamos?</label>
              <DatePicker
                key={datePickerKey}
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                filterDate={isValidStart}
                locale={"es"}
                minDate={startDate}
                dateFormat="dd/MM/yyyy"
                customInput={<CustomInput />}
              />
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="w-100">
              <label className="label-input"></label>
              <button onClick={searchParrilla} className="btn">
                Buscar servicios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusquedaServicio;
