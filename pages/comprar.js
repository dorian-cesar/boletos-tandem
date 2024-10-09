import axios from "axios";
import Layout from "components/Layout";
import Footer from 'components/Footer';
import BusquedaServicio from 'components/BusquedaServicio/BusquedaServicio';
import React, { useEffect, useState } from "react";
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
import StagePasajes from "../components/ticket_sale/StagePasajes/StagePasajes";
import StagePago from "../components/ticket_sale/StagePago/StagePago";

import { decryptDataNoSaved } from "utils/encrypt-data";
import { useDispatch, useSelector } from "react-redux";
import { agregarOrigenDestino } from "store/usuario/compra-slice";

import CryptoJS from "crypto-js";

import { generateToken } from 'utils/jwt-auth';
import Script from "next/script";

registerLocale("es", es);

const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;

const stages = [
    {
        name: "Servicio ida",
        kind: "pasajes_1",
    },
    {
        name: "Servicio vuelta",
        kind: "pasajes_2",
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
    
    const router = useRouter();
    const decryptedData = router.query.search ? decryptDataNoSaved(router.query.search, 'search') : null;

    const startDate = dayjs(decryptedData?.startDate).isValid() ? dayjs(decryptedData?.startDate).toDate(): null;
    const endDate = dayjs(decryptedData?.endDate).isValid() ? dayjs(decryptedData?.endDate).toDate() : null;
    const origen = decryptedData?.origen?.codigo || '';
    const destino = decryptedData?.destino != "null" ? decryptedData?.destino?.codigo : null;
    const mascota_allowed = decryptedData?.mascota_allowed || false;

    const stateCompra = useSelector((state) => state.compra);

    const [modalMab, setModalMab] = useState(false);
    const [parrilla, setParrilla] = useState([]);
    const [loadingParrilla, setLoadingParrilla] = useState(true);
    const [carro, setCarro] = useState({
        clientes_ida: [],
        pasaje_ida: null,
        clientes_vuelta: [],
        pasaje_vuelta: null,
        datos: { tipoRut: "rut" },
    });
    const [stage, setStage] = useState(0);

    const dispatch = useDispatch();
    
    useEffect(() => {
        const origenDestino = {
            origen: decryptedData?.origen,
            destino: decryptedData?.destino
        }
        dispatch(agregarOrigenDestino(origenDestino));
        setStage(0);
        // TODO: Descomentar si falla en produccion
        // searchParrilla(0);
    }, [router.query.search])

    async function searchParrilla(in_stage) {
        try {
            debugger;
            const stage_active = in_stage ?? stage;
            setLoadingParrilla(true);

            const token = generateToken();
            
            const request = CryptoJS.AES.encrypt(
                JSON.stringify(new ObtenerParrillaServicioDTO(stage_active, origen, destino, startDate, endDate)),
                secret
            );

            const response = await fetch(`/api/parrilla`, {
                method: "POST",
                body: JSON.stringify({ data: request.toString() }),
                headers: {
                    Authorization: `Bearer ${ token }`
                }
            });
            
            const parrilla = await response.json();

            // const parrilla = await axios.post("/api/parrilla", new ObtenerParrillaServicioDTO(stage_active, origen, destino, startDate, endDate));
            setParrilla(parrilla.map((parrillaMapped, index) => {
                return {
                    ...parrillaMapped,
                    id: index + 1
                }
            }));
            setLoadingParrilla(false);   
        } catch (e) {
            console.error(e)
            console.error(`Error al obtener parrilla [${ e.message }]`)
        }
    };

    const stages_active = endDate ? stages : stages.filter((i) => i.kind != "pasajes_2");

    // TODO: Descomentar si falla en produccion
    // useEffect(() => {
    //     searchParrilla();
    // }, [stage]);

    useEffect(() => {
        if( stage === 0 || stage === 1 ) {
            searchParrilla();
        }
    }, [stage]);

    useEffect(() => {
        window.scrollTo({top: 0});
    }, [stage])

    return (
        <Layout>
            <Head>
                <title>Pullman Bus | Compra Boleto</title>
            </Head>
            <div className="pasajes">
                <div className="container">
                    <BusquedaServicio
                        origenes={props.ciudades}
                        dias={props.dias}
                        isShowMascota={false}
                        isHomeComponent={false}/>
                </div>
            </div>
            <div className="pasajes-compra pb-5">
                <div className="container">
                    <ul className="d-flex flex-row justify-content-around py-4 px-0">
                        {
                            stages.filter((stageMaped) => endDate || (!endDate && stageMaped.kind != "pasajes_2")).map((stageMaped, indexStage) => {
                                return (
                                    <div key={`stage-${indexStage}`}
                                         className={"seleccion text-center select-num " + (indexStage == stage ? "active" : "")}>
                                        <div className="numeros">
                                            <div className="numero">
                                                {indexStage + 1}
                                            </div>
                                        </div>
                                        <h3>{stageMaped.name}</h3>
                                    </div>
                                )
                            })
                        }
                    </ul>
                    {
                        stages_active[stage].kind == "pasajes_1" || stages_active[stage].kind == "pasajes_2" ?
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
                                origen={stages_active[stage].kind == "pasajes_1" ? stateCompra.origen : stateCompra.destino}
                                destino={stages_active[stage].kind == "pasajes_2" ? stateCompra.destino : stateCompra.origen}
                                setModalMab={setModalMab}
                                mascota_allowed={mascota_allowed}/> : ('')
                    }
                    {
                        stages_active[stage].kind == "pago" ?
                            <StagePago
                                key={'stage-pago'}
                                carro={carro}
                                nacionalidades={props.nacionalidades}
                                convenios={props.convenios}
                                mediosDePago={props.mediosDePago}
                                setCarro={setCarro}/> : ('')
                    }
                </div>
            </div>
            {modalMab ? (
                <div className="modal fade show" tabindex="-1" role="dialog">
                    <div
                        className="modal-dialog modal-dialog-centered modal-lg"
                        role="document"
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <b>
                                        Seleccionaste un asiento dentro del
                                        espacio reservado para mascotas abordo
                                    </b>
                                </h5>
                                <button
                                    type="button"
                                    className="close"
                                    data-dismiss="modal"
                                    aria-label="Close"
                                    onClick={() => setModalMab(false)}
                                >
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body d-flex align-items-center">
                                <img
                                    src="/MAB-logo1.png"
                                    className="col-12 col-md-3"
                                />
                                <ul className="p-1 list-style-dot">
                                    <li>
                                        Sólo puede viajar una mascota por pasajero.
                                    </li>
                                    <li>
                                        Sólo transportamos a perros y gatos que quepan cómodamente en un canil rígido y
                                        cerrado que va sobre el asiento asignado. El canil no puede superar los 60 cm de
                                        largo, 39 cm de ancho y 34 cm de alto.
                                    </li>
                                    <li>
                                        Debe llevar firmada una "Declaración Jurada de tenencia responsable" al momento
                                        de abordar la cual se adjunta con el envío de pasajes MAB al correo.
                                    </li>
                                </ul>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setModalMab(false)}
                                >
                                    Continuar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                ""
            )}
            <ToastContainer/>
            <Footer/>
            <Script async={true} defer={true} src="https://tracking.bciplus.cl/bciplus/script.js" />
        </Layout>
    );
}

export const getServerSideProps = withIronSessionSsr(async function ({req, res, query }) {
    const decryptedData = query.search ? decryptDataNoSaved(query.search, 'search') : null;
    if( !decryptedData || !decryptedData?.origen || !decryptedData?.destino || !decryptedData?.startDate ) {
        return {
            redirect: {
                permanent: false,
                destination: '/'
            }
        }
    }

    let ciudades = await axios.get(
        publicRuntimeConfig.site_url + "/api/ciudades"
    );

    let destinos = await axios.post(
        publicRuntimeConfig.site_url + "/api/destinos",
        { id_ciudad: query.origen }
    );

    return {
        props: {
            ciudades: ciudades.data,
            destinos: destinos.data
        },
    };
}, sessionOptions);
