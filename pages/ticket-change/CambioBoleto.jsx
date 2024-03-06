import axios from "axios";
import Layout from "../../components/Layout";
import Footer from "../../components/Footer";
import BusquedaServicio from "../../components/ticket-change/BusquedaServicio/BusquedaServicio";
import { useEffect, useState } from "react";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import getConfig from "next/config";
import dayjs from "dayjs";
import { registerLocale } from "react-datepicker";
import { useRouter } from "next/router";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
const { publicRuntimeConfig } = getConfig();
import es from "date-fns/locale/es";
import { ObtenerParrillaServicioDTO } from "dto/ParrillaDTO";
import StagePasajes from "../../components/ticket-change/StagePasajes";
import StagePago from "../../components/ticket-change/StagePago/StagePago";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";

registerLocale("es", es);

const stages = [
  {
    name: 'Validación boleto',
    kind: 'validacion'
  },
  {
    name: "Selección servicio",
    kind: "pasajes_1",
  },
  {
    name: "Pago",
    kind: "pago",
  },
  {
    name: "Confirmación",
    kind: "confirmacion",
  },
];

export default function Home(props) {
  async function validarBoleto() {
    try {
      const { data } = await axios.post("/api/ticket_sale/validar-cambio", {
        boleto,
      });
      setBoletoValido(data);
      setStage(1);
    } catch ({ response }) {
      const { message } = response.data;
      toast.error(message, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
      });
    }
  }

  const router = useRouter();

  const startDate = dayjs(router.query.startDate).isValid()
    ? dayjs(router.query.startDate).toDate()
    : null;
  const endDate = dayjs(router.query.endDate).isValid()
    ? dayjs(router.query.endDate).toDate()
    : null;
  const origen = router.query.origen;
  const destino = router.query.destino != "null" ? router.query.destino : null;

  const [modalMab, setModalMab] = useState(false);
  const [parrilla, setParrilla] = useState([]);
  const [loadingParrilla, setLoadingParrilla] = useState(true);
  const [boleto, setBoleto] = useState(null);
  const [boletoValido, setBoletoValido] = useState({});
  const [carro, setCarro] = useState({
    clientes_ida: [],
    pasaje_ida: null,
    clientes_vuelta: [],
    pasaje_vuelta: null,
    datos: { tipoRut: "rut" },
  });
  const [stage, setStage] = useState(0);

  async function searchParrilla(in_stage) {
    try {
        const stage_active = in_stage ?? stage;
        setLoadingParrilla(true);
        const parrilla = await axios.post("/api/parrilla", new ObtenerParrillaServicioDTO(stage_active, origen, destino, startDate, endDate));
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

const stages_active = endDate ? stages : stages.filter((i) => i.kind != "pasajes_2");

useEffect(() => {
    searchParrilla();
}, []);


  return (
    <Layout>
      <Head>
        <title>PullmanBus | Cambio Boleto</title>
      </Head>
      <div className="pullman-mas">
        <div className="container">
          <div className="row py-4">
            <div className="col-12">
              <span>Home &gt; Te ayudamos &gt; Cambio de boleto </span>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 col-12 d-flex align-items-center">
              <div>
                <img src="img/icon-estrella-mas.svg" alt="" />
                <h1>
                  Te Ayudamos con tu
                  <br /> <strong>cambio de Boleto</strong>
                </h1>
              </div>
            </div>
            <div className="col-md-6 col-12 foto-header">
              <img src="img/cambioboleto2.svg" className="img-fluid" alt="" />
            </div>
          </div>
        </div>
        <div className="pasajes-compra bg-transparent">
          <div className="container">
            <ul className="d-flex flex-row justify-content-around py-4">
              {
                stages.filter((stageMaped) => endDate || (!endDate && stageMaped.kind != "pasajes_2")).map((stageMaped, indexStage) => {
                  return(
                    <div key={ `stage-${ indexStage }` } className={ "seleccion text-center " + (indexStage == stage ? "active" : "")}>
                      <div className="numeros">
                        <div className="numero">
                          { indexStage + 1 }
                        </div>
                      </div>
                      <h3>{stageMaped.name}</h3>
                    </div>
                  )
                })
              }
            </ul>
          </div>
        </div>
      </div>
      {stage == 0 ? (
        <div className="codigo-boleto mb-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 col-md-6">
                <div className="bloque">
                  <h2>
                    Ingresa el código de tu boleto para{" "}
                    <strong>visualizar el boleto que quieres cambiar</strong>
                  </h2>
                  <div className="grupo-campos">
                    <label className="label-input">Código de boleto</label>
                    <input
                      type="text"
                      name=""
                      value={boleto}
                      onChange={(e) => setBoleto(e.target.value.toUpperCase())}
                      className="form-control"
                    />
                  </div>
                  <div className="w-100">
                    <button onClick={ (boleto) && validarBoleto} className="btn">
                      Buscar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    {stage == 1 ? (
        <div className="ingreso-destino mb-5">
          <div className="container">
            <div className="row">
              {/* hacer componente para buscardor */}
              <BusquedaServicio
                origenes={props.ciudades}
                dias={props.dias}
                isShowMascota={true}
                setParrilla={setParrilla}
                setLoadingParrilla={setLoadingParrilla}
                boletoValido={boletoValido}
                buscaAlIniciar={true}
              />

              <div className="contenido-busqueda">
                {loadingParrilla ? <Loader /> : parrilla.length > 0 ? 
                
                <div className="pasajes-compra py-5">
                <div className="container">
                  {stages_active[stage].kind == "pasajes_1" ||
                  stages_active[stage].kind == "pasajes_2" ? (
                    <StagePasajes
                      key={`stage-pasajes-${stages_active[stage].kind}`}
                      stage={stage}
                      parrilla={parrilla}
                      loadingParrilla={loadingParrilla}
                      setParrilla={setParrilla}
                      startDate={startDate}
                      endDate={endDate}
                      carro={carro}
                      setCarro={setCarro}
                      setStage={setStage}
                      searchParrilla={searchParrilla}
                      boletoValido={boletoValido}
                    />
                  ) : (
                    ""
                  )}
                  {stages_active[stage].kind == "pago" ? (
                    <StagePago
                      key={"stage-pago"}
                      carro={carro}
                      nacionalidades={props.nacionalidades}
                      convenios={props.convenios}
                      mediosDePago={props.mediosDePago}
                      setCarro={setCarro}
                      boletoValido={boletoValido}
                    />
                  ) : (
                    ""
                  )}
                </div>
              </div>
                
                
                : 
                  <h5 className="p-2">
                      Lo sentimos, no existen
                      resultados para su búsqueda
                   </h5>
                }
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {stage == 2 ? (
        <StagePago
            key={"stage-pago"}
            carro={carro}
            nacionalidades={props.nacionalidades}
            convenios={props.convenios}
            mediosDePago={props.mediosDePago}
            setCarro={setCarro}
            boletoValido={boletoValido}
        />
      ) : (
        ""
      )}

      <ToastContainer />
      <Footer />
    </Layout>
  );
}

export const getServerSideProps = withIronSessionSsr(async function ({
  req,
  res,
  query,
}) {
  let ciudades = await axios.get(
    publicRuntimeConfig.site_url + "/api/ciudades"
  );

  let destinos = await axios.post(
    publicRuntimeConfig.site_url + "/api/destinos",
    { id_ciudad: query.origen }
  );

  let dias = await axios.get(publicRuntimeConfig.site_url + "/api/dias");

  let nacionalidades = await axios.get(
    publicRuntimeConfig.site_url + "/api/nacionalidades"
  );

  let convenios = await axios.get(
    publicRuntimeConfig.site_url + "/api/convenios"
  );

  let mediosDePago = await axios.get(
    publicRuntimeConfig.site_url + "/api/medios-de-pago"
  );

  return {
    props: {
      ciudades: ciudades.data,
      dias: dias.data,
      nacionalidades: nacionalidades.data,
      convenios: convenios.data,
      mediosDePago: mediosDePago.data,
      destinos: destinos.data,
    },
  };
},
sessionOptions);
