import axios from "axios";
import Layout from "components/Layout";
import { useEffect, useState, forwardRef, useRef, useMemo } from "react";
import { withIronSessionSsr } from "iron-session/next";
import getConfig from "next/config";
import dayjs from "dayjs";
import DatePicker, { registerLocale } from "react-datepicker";
import { sessionOptions } from "lib/session";
import es from "date-fns/locale/es";
import Loader from "../components/Loader";
registerLocale("es", es);
import { ToastContainer, toast } from "react-toastify";
import Head from "next/head";
import { useTable, usePagination } from "react-table";
import Rut from "rutjs";
import { useForm } from "/hooks/useForm";

const anularDatosForm = {
  boleto: [],
  codigoTransaccion: "",
  rutSolicitante: "",
  usuario: "",
  banco: "",
  tipoCuenta: "",
  numeroCuenta: "",
  rutTitular: "",
  email: "",
};

export default function Devolucion(props) {
  const columns = useMemo(
    () => [
      {
        Header: "Boleto",
        accessor: "boleto",
      },
      {
        Header: "Fecha",
        accessor: "imprimeVoucher.fechaSalida",
      },
      {
        Header: "Origen",
        accessor: "imprimeVoucher.nombreCiudadOrigen",
      },
      {
        Header: "Destino",
        accessor: "imprimeVoucher.nombreCiudadDestino",
      },
      {
        Header: "Asiento",
        accessor: "asiento",
      },
      {
        Header: "Valor",
        accessor: "imprimeVoucher.total",
      },
      {
        Header: "Estado",
        accessor: "estado",
      },
      {
        Header: "Seleccionar",
        accessor: "click",
      },
    ],
    []
  );
  const [data, setData] = useState([]);
  const [stage, setStage] = useState(0);
  const [tipoCuentas, setTipoCuentas] = useState([]);
  const [tipoCuenta, setTipoCuenta] = useState(null);
  const [bancos, setBancos] = useState([]);
  const [banco, setBanco] = useState(null);
  const [codigoTransaccion, setCodigoTransaccion] = useState(null);
  const [seleccionAnular, setSeleccionAnular] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validarAnulacion, setValidarAnulacion] = useState(1);
  const [visiblePrincipal, setVisiblePrincipal] = useState(0);
  const { formState: registro, onInputChange } = useForm(anularDatosForm);
  const [error, setError] = useState({
    errorMsg: "",
    status: false,
  });

  const tableInstance = useTable(
    { columns, data, initialState: { pageIndex: 0, pageSize: 5 } },
    usePagination
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    state: {},
  } = tableInstance;

  async function obtenerBancos() {
    let data = await axios.post("/api/bancos", {});
    setBancos(data.data.object);
  }

  async function validarTransaccion() {
    setIsLoading(true);
    let codigo = codigoTransaccion;
    let resp = await axios.post("/api/devolucion-boletos", { codigo });
    if (resp.data) {
      setData(resp.data?.object);
      setStage(1);
      setIsLoading(false);
    } else {
      toast.error(resp.data.error, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
      });
      setIsLoading(false);
    }
  }

  const marcarBoletoDevolucion = async (boleto) => {
    let seleccionAnular_temp = [...seleccionAnular];
    if (seleccionAnular.includes(boleto)) {
      seleccionAnular_temp = seleccionAnular.filter((i) => i != boleto);
    } else {
      seleccionAnular_temp.push(boleto);
    }
    setSeleccionAnular(seleccionAnular_temp);
    if (seleccionAnular.length > 0) {
      obtenerTipoBanco();
    }
  };

  async function obtenerTipoBanco() {
    if (seleccionAnular.length > 0) {
      if (seleccionAnular[0].original.tipoCompra === "VD") {
        let codigo = "VD";
        let resp = await axios.post("/api/tipo-cuenta", { codigo });
        if (resp.data) {
          setTipoCuentas(resp.data?.object);
        }
      } else {
        let codigo = "VC";
        let resp = await axios.post("/api/tipo-cuenta", { codigo });
        if (resp.data) {
          setTipoCuentas(resp.data?.object);
        }
      }
    }
  }

  async function anular() {
   
    let boleto = [];
    seleccionAnular.map((data) => {
      boleto.push(data.original.boleto);
    });
    registro.boleto = boleto;
    registro.banco = banco;
    registro.tipoCuenta = tipoCuenta;
    registro.codigoTransaccion = codigoTransaccion;
    const formStatus = await validarForm();
    if(formStatus){
      try {
        setIsLoading(true);
        let resp = await axios.post("/api/anulacion", { ...registro });
        if (resp.data.status) {
          setIsLoading(false);
          activarExito();
        }
      } catch (e) {
        if (!!e.response) {
          const { message } = e.response?.data;
          setError({ status: true, errorMsg: message });
        } else {
          setError({ status: true, errorMsg: "Ocurrió un error inesperado." });
        }
        setIsLoading(false);
      }
    }
  }

  function validarForm() {
    return new Promise((resolve, reject) => {
      const values = Object.values(registro);
      const camposVacios = values.filter((v) => v == "");
      if (camposVacios.length > 0) {
        setError({
          status: true,
          errorMsg: "Se requiere rellenar todos los campos.",
        });
        resolve(false);
      } else {
        let rutSolicitante = new Rut(registro?.rutSolicitante);
        let rutTitular = new Rut(registro?.rutTitular);
        if (!rutSolicitante?.isValid) {
          setError({
            status: true,
            errorMsg: "Se requiere ingresar un rut válido solicitante",
          });
          return resolve(false);
        }
        if (!rutTitular?.isValid) {
          setError({
            status: true,
            errorMsg: "Se requiere ingresar un rut válido titular",
          });
          return resolve(false);
        }
        
        setError({ status: false, errorMsg: '' });
        resolve(true);
      
      }
    });
  }

  function limpiar() {
    setData([]);
    setStage(0);
    setCodigoTransaccion("");
    setTipoCuenta([]);
    setSeleccionAnular([]);
  }

  function activarExito() {
    setVisiblePrincipal(1);
    setValidarAnulacion(0);
    setStage(0);
    limpiar();
  }

  useEffect(() => {
    (async () => await obtenerBancos())();
  }, []);

  return (
    <Layout>
      <Head>
        <title>PullmanBus | </title>
      </Head>
      <div className="pullman-mas mb-5">
        <div className="container">
          <div className="row py-4">
            <div className="col-12">
              <span>Home &gt; Te ayudamos &gt; Devolución</span>
            </div>
          </div>
          <div className="row pb-5">
            <div className="col-md-6 col-12 foto-header">
              <img src="img/cambioboleto2.svg" className="img-fluid" alt="" />
            </div>
          </div>
        </div>
      </div>

      {visiblePrincipal == 0 ? (
        <div className="container">
          <div className="bloque comprador  bg-white">
            <div className="col-12 col-md-12">
              <h1 className="titulo-azul text-center">
                Ingresa el código de tu transacción para visualizar los boleto
                que quieres devolver
              </h1>
              <div className="grupo-campos">
                <label className="label-input">Código de transacción</label>
                <input
                  type="text"
                  placeholder="Ej: HRJAS12FDA"
                  className="form-control"
                  value={codigoTransaccion}
                  onChange={(e) => setCodigoTransaccion(e.target.value)}
                />
              </div>
              <div className="row mt-5">
                <div className="col-12 col-md-3">
                  <button
                    className="btn"
                    onClick={codigoTransaccion && validarTransaccion}
                  >
                    Buscar
                  </button>
                </div>
                <div className="col-12 col-md-3">
                  <button className="btn btn-limpiar" onClick={limpiar}>
                    Limpiar
                  </button>
                </div>
              </div>
              {isLoading ? (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden"></span>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {stage == 1 ? (
        <div className="container">
          <div className="bloque comprador  bg-white">
            <h1 className="titulo-azul text-center">Detalle de boletos</h1>
            <table
              className="table table-striped align-middle table-borderless"
              {...getTableProps()}
            >
              <thead className="fondo-naranja">
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th {...column.getHeaderProps()}>
                        {column.render("Header")}
                      </th>
                    ))}
                    <th></th>
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.map((row, i) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => {
                        return (
                          <td {...cell.getCellProps()}>
                            {cell.render("Cell")}
                          </td>
                        );
                      })}
                      <td>
                        {row.original.estado === "NUL" ? (
                          ""
                        ) : (
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id={"boleto" + i}
                            onClick={() => marcarBoletoDevolucion(row)}
                            value={row}
                            checked={seleccionAnular.includes(row)}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        ""
      )}
      {seleccionAnular.length > 0 && tipoCuentas.length > 0 ? (
        <div className="container">
          <div className="bloque comprador  bg-white">
            <h1 className="titulo-azul text-center">Datos devolución</h1>
            <div className="col-12 col-md-12">
              {error.status ? (
                <div className="alert alert-danger" role="alert">
                  {error?.errorMsg}
                </div>
              ) : (
                ""
              )}
            </div>

            <div className="row mt-5">
              <div className="col-12 col-md-6">
                <div className="grupo-campos">
                  <label className="label-input">Tipo de cuenta</label>
                  <select
                    name="tipoCuenta"
                    id="cars"
                    className="form-control seleccion"
                    value={tipoCuenta}
                    onChange={(e) => setTipoCuenta(e.target.value)}
                  >
                    <option value="">Seleccione tipo cuenta</option>
                    {tipoCuentas.map((tipoCuenta) => (
                      <option value={tipoCuenta?.codigo}>
                        {tipoCuenta?.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="grupo-campos">
                  <label className="label-input">Rut solicitante</label>
                  <input
                    type="text"
                    name="rutSolicitante"
                    placeholder="Rut solicitante : 11111111-1"
                    className={"form-control form-control-modal"}
                    value={registro?.rutSolicitante}
                    onChange={onInputChange}
                  />
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="grupo-campos">
                  <label className="label-input">E-mail</label>
                  <input
                    type="text"
                    name="email"
                    placeholder="Email"
                    className={"form-control form-control-modal"}
                    value={registro?.email}
                    onChange={onInputChange}
                  />
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="grupo-campos">
                  <label className="label-input">Rut titular cuenta</label>
                  <input
                    type="text"
                    name="rutTitular"
                    placeholder="Rut del titular de la cuenta : 11111111-1"
                    className={"form-control form-control-modal"}
                    value={registro?.rutTitular}
                    onChange={onInputChange}
                  />
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="grupo-campos">
                  <label className="label-input">N° de cuenta</label>
                  <input
                    type="text"
                    name="numeroCuenta"
                    placeholder="Número de cuenta"
                    className={"form-control form-control-modal"}
                    value={registro?.numeroCuenta}
                    onChange={onInputChange}
                  />
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="grupo-campos">
                  <label className="label-input">Nombre titular cuenta</label>
                  <input
                    type="text"
                    name="usuario"
                    placeholder="Nombre titular"
                    className={"form-control form-control-modal"}
                    value={registro?.usuario}
                    onChange={onInputChange}
                  />
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="grupo-campos">
                  <label className="label-input input-op">Banco</label>
                  <select
                    name="banco"
                    id="cars"
                    className="form-control seleccion"
                    value={banco}
                    onChange={(e) => setBanco(e.target.value)}
                  >
                    <option value="">Seleccione banco</option>
                    {bancos.map((banco) => (
                      <option value={banco.codigo}>{banco.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-12 col-md-6"></div>
              <div className="col-12 col-md-3">
                <button className="btn" onClick={(e) => tipoCuenta && anular()}>
                  Anular
                </button>
              </div>
              {isLoading ? (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden"></span>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {validarAnulacion == 0 ? (
        <div className="container">
          <div className="bloque comprador  bg-white">
            <div className="col-12 col-md-12">
              <h1 className="titulo-azul text-center">
                ¡Estimado usuario, se enviará a su correo el detalle de los
                boletos anulados!
              </h1>
            </div>
            <div className="row mt-5">
              <div className="col-12 col-md-3">
                <div className="row mt-5"></div>
              </div>
              <div className="col-12 col-md-3">
                <div className="grupo-campos">
                  <a href="/devolucion">
                    <button className="btn">Devolución</button>
                  </a>
                </div>
                <div className="row mt-5"></div>
              </div>
              <div className="col-12 col-md-3">
                <div className="grupo-campos">
                  <a href="/">
                    <button className="btn btn-limpiar">Volver</button>
                  </a>
                </div>
                <div className="row mt-5"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      <ToastContainer />
    </Layout>
  );
}

export const getServerSideProps = withIronSessionSsr(async function ({
  req,
  res,
}) {
  return {
    props: {},
  };
},
sessionOptions);
