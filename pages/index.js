import axios from "axios";
import Layout from "components/Layout";
import Footer from "components/Footer";
import BusquedaServicio from "components/BusquedaServicio/BusquedaServicio";
import Ofertas from "components/Ofertas";
import Head from "next/head";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import getConfig from "next/config";
import { registerLocale } from "react-datepicker";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import Banner from "components/banner";

const { publicRuntimeConfig } = getConfig();
import es from "date-fns/locale/es";
import { useRouter } from "next/router";

registerLocale("es", es);

export default function Home(props) {
  const origenes = props.ciudades;

  return (
    <Layout>
      <Head>
        <title>PullmanBus | Inicio</title>
      </Head>
      <div className="home">
        <Banner />
        <BusquedaServicio
          origenes={origenes}
          dias={props.dias}
          isShowMascota={true}
        />

        <Ofertas />
      </div>
      <Footer />
    </Layout>
  );
}

export const getServerSideProps = withIronSessionSsr(async function ({
  req,
  res,
}) {
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
},
sessionOptions);
