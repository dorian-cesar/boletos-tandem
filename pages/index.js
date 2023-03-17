import axios from "axios";
import Layout from "components/Layout";
import Footer from "components/Footer";
import BusquedaServicio from 'components/BusquedaServicio';
import Head from "next/head";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import getConfig from "next/config";
import { registerLocale } from "react-datepicker"

const { publicRuntimeConfig } = getConfig();
import es from "date-fns/locale/es";

registerLocale("es", es);

export default function Home(props) {
    const origenes = props.ciudades;

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
                <BusquedaServicio origenes={ origenes } dias={ props.dias } isShowMascota={ true }/>
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