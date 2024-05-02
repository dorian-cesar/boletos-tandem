import axios from "axios";
import Layout from "../../components/Layout";
import Footer from "../../components/Footer";
import BusquedaServicio from "../../components/ticket-confirmation/BusquedaServicio/BusquedaServicio";
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
import StagePasajes from "../../components/ticket-confirmation/StagePasajes";
import StagePago from "../../components/ticket-confirmation/StagePago/StagePago";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";

import styles from './ConfirmacionBoleto.module.css'

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
      const { data } = await axios.post("/api/ticket_sale/validar-boleto-blanco", {
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
      console.log('Planilla de asientos', parrilla)
      setParrilla(parrilla.data.map((parrillaMapped, index) => {
        return {
          ...parrillaMapped,
          id: index + 1
        }
      }));
      setLoadingParrilla(false);
    } catch ({ message }) {
      console.error(`Error al obtener parrilla [${message}]`)
    }
  };

  const stages_active = endDate ? stages : stages.filter((i) => i.kind != "pasajes_2");

  useEffect(() => {
    searchParrilla();
  }, []);


  return (
    <Layout>
      <Head>
        <title>PullmanBus | Confirmación Boleto</title>
      </Head>
      <div className={styles["home"]}>
        <div className="pullman-mas">
          <div className="container">
          <div className= {`row py-4 ${styles["nav"]}`}>
  
                <span>Inicio  &gt; Confirmación de boleto </span>
              
            </div>
          </div>

        </div>
        {stage == 0 ? (
          <div className={`mb-5 container ${styles["fondo-cambio"]}`}>
            <div className="container">
              <div className={styles["cambio-title"]}>
                <h2>
                  Confirmacío de boleto
                </h2>
              </div>
              <div className={styles["bloque"]}>
                <div className={styles["bloque-texto"]}>
                  <p>
                    Ingresa el código de tu boleto para{" "}
                    <strong>visualizar el boleto que quieres confirmar</strong>
                  </p>
                </div>
                <div className={styles["container"]}>
                  <div className={`row search-row ${styles["search-row"]}`}>
                    <div className={ styles["search-row-container"]}>
                      <div className={styles["grupo-campos"]}>
                        <label>Código de boleto</label>
                        <input
                          type="text"
                          name=""
                          value={boleto}
                          onChange={(e) => setBoleto(e.target.value.toUpperCase())}
                          className={styles["input"]}
                        />
                      </div>
                      <div className={styles["grupo-campos"]}>
                        <div className={styles["button"]}>
                          <button
                            className={
                              boleto
                                ? styles["button-search-coupon"]
                                : styles["button-search-coupon-disabled"]
                            }
                            onClick={(boleto) && validarBoleto} >
                            <img src="../img/icon/cuponera/search-outline.svg" />
                            Buscar
                          </button>
                        </div>
                      </div>
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
                      <div className="">
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
      </div>
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
