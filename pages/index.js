import axios from "axios";
import Layout from "components/Layout";
import Footer from "components/Footer";
import Head from "next/head";
import { useEffect, useState, forwardRef } from "react";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import getConfig from "next/config";
import dayjs from "dayjs";
import DatePicker, { registerLocale } from "react-datepicker";
import Link from "next/link";
import Input from "../components/Input";
const { publicRuntimeConfig } = getConfig();
import es from "date-fns/locale/es";

registerLocale("es", es);

const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <input type="text" className="fecha-input form-control" onClick={ onClick } ref={ ref } value={ value }/>
));

export default function Home(props) {
    const origenes = props.ciudades;

    const [mascota_allowed, setMascota] = useState(false);
    const [origen, setOrigen] = useState(null);
    const [destino, setDestino] = useState(null);
    const [destinos, setDestinos] = useState([]);
	const [startDate, setStartDate] = useState(dayjs().toDate());
    const [endDate, setEndDate] = useState(null);

    async function getDestinos() {
        if (origen !== null) {
            let { data } = await axios.post("/api/destinos", {
                id_ciudad: origen,
            });
            setDestinos(data);
        }
    };

    async function isValidStart(date) {
        return (
            dayjs(date).isAfter(dayjs().subtract(1, "day")) &&
            dayjs(date).isBefore(dayjs().add(props.dias, "day"))
        );
    };

    async function isValidAfter(date) {
        return (
            dayjs(date).isAfter(dayjs(startDate).subtract(1, "day")) &&
            dayjs(date).isBefore(dayjs().add(props.dias, "day"))
        );
    };

	function retornaCiudadesSelect(arrayCiudades) {
		return arrayCiudades.map(ciudad => {
			return {
				value: ciudad?.codigo,
				label: ciudad?.nombre
			}
		})
	}

	function cambiarOrigen(origenSeleccionado) {
		setDestino(null);
		setOrigen(origenSeleccionado);
	}

	useEffect(() => {
        (async () => await getDestinos())();
    }, [origen]);

	useEffect(() => {
        if (endDate && dayjs(startDate).isAfter(dayjs(endDate))) {
            setEndDate(dayjs(startDate).toDate());
        }
    }, [startDate]);

    return (
        <Layout>
            <Head>
                <title>PullmanBus | Inicio</title>
            </Head>
            <div className="home">
                <div className="img-principal d-none d-md-block">
                    <img src="/banner-1.png" />
                </div>
                <div className="img-principal d-block d-md-none">
                    <img src="/banner-mobile.png" />
                </div>
                <div className="container pb-5">
                    <div className="row ">
                        <div className="col-12">
                            <div className="bloque m-neg">
                                <div className="row mb-3 ">
                                    <div className="col-12 col-md-6">
                                        <h1 className="titulo-azul">
                                            Detalles de tu viaje
                                        </h1>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex w-100 justify-content-end align-items-center" onClick={ () => setMascota(!mascota_allowed) }>
                                            <img src="img/icon-patita.svg" style={{ marginRight: "5px" }} />
                                            <span>Mascota a bordo</span>
                                            <label className={ "switch " + (mascota_allowed ? "checked" : "") }>
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="row search-row">
                                    <div className="col-12 col-md-6 col-lg-3">
                                        <div className="grupo-campos">
                                            <label className="label-input">
                                                ¿De dónde viajamos?
                                            </label>
                                            <Input
                                                className="sel-input origen"
                                                placeholder="Origen"
                                                items={ retornaCiudadesSelect(origenes) }
                                                selected={ origen && retornaCiudadesSelect([origenes.find((i) => i.codigo == origen)]) }
                                                setSelected={ cambiarOrigen }
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-3">
                                        <div className="grupo-campos">
                                            <label className="label-input">
                                                ¿A dónde viajamos?
                                            </label>
                                            <Input
                                                className="sel-input destino"
                                                placeholder="Destino"
                                                items={ retornaCiudadesSelect(destinos) }
                                                selected={ destino && destinos.length > 0 && retornaCiudadesSelect([destinos.find((i) => i.codigo == destino)]) }
                                                setSelected={ setDestino }
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-6 col-lg-2">
                                        <div className="grupo-campos">
                                            <label className="label-input">
                                                ¿Fecha de ida?
                                            </label>
                                            <DatePicker
                                                selected={ startDate }
                                                onChange={ (date) => setStartDate(date) }
                                                filterDate={ isValidStart }
                                                locale={ "es" }
												minDate={ new Date() }
                                                dateFormat="dd/MM/yyyy"
                                                customInput={ <CustomInput /> }
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-6 col-lg-2">
                                        <div className="grupo-campos">
                                            <label className="label-input">
                                                ¿Fecha de regreso?
                                            </label>
                                            <DatePicker
                                                selected={ endDate }
                                                onChange={ (date) => setEndDate(date) }
                                                filterDate={ isValidAfter }
                                                locale={ "es" }
												minDate={ startDate }
                                                dateFormat="dd/MM/yyyy"
                                                customInput={ <CustomInput /> }
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-12 col-lg-2">
                                        <Link 
											href={ origen && destino ? `/comprar?origen=${ origen }&destino=${ destino }&startDate=${ startDate && dayjs(startDate).format('YYYY-MM-DD') }&endDate=${ endDate && dayjs(startDate).format('YYYY-MM-DD')}` : "#" }
											legacyBehavior
                                        >
                                            <a className={ origen && destino ? "btn" : "btn btn-disabled" } href="">
                                                <img src="img/icon-buscar-blanco.svg" />{" "}
                                                Buscar servicios
                                            </a>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </Layout>
    );
}

export const getServerSideProps = withIronSessionSsr(async function ({ req, res }) {
	let ciudades = await axios.get(
        publicRuntimeConfig.site_url + "/api/ciudades"
    );

    let promociones = await axios.get(
        publicRuntimeConfig.site_url + "/api/promociones"
    );

    let dias = await axios.get(publicRuntimeConfig.site_url + "/api/dias");

    return {
        props: {
            ciudades: ciudades.data,
            dias: dias.data,
            promociones: promociones.data,
        },
    };
}, sessionOptions);