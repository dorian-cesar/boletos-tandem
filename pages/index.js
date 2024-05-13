import axios from "axios";
import Layout from "components/Layout";
import Footer from "components/Footer";
import BusquedaServicio from "components/BusquedaServicio/BusquedaServicio";
import Ofertas from "components/Ofertas/Ofertas";
import Head from "next/head";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import getConfig from "next/config";
import { registerLocale } from "react-datepicker";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { liberarAsientos } from "store/usuario/compra-slice";
import { limpiarCambio } from "store/usuario/cambio-boleto-slice";

import Banner from "components/banner";

import Popup from "components/Popup/Popup";

import ModalEntities from "entities/ModalEntities";

const { publicRuntimeConfig } = getConfig();
import es from "date-fns/locale/es";

registerLocale("es", es);

export default function Home(props) {
  const origenes = props.ciudades;
  const dispatch = useDispatch();

  const [isShowModalMobile, setIsShowModalMobile] = useState(false);

  useEffect(() =>{ 
    dispatch(liberarAsientos()) 
    dispatch(limpiarCambio())
  }, []);

  useEffect(() => {
    const width = window.innerWidth;
    const fechaLimite = new Date(2024, 4, 21);
    if( width < 770  && new Date() < fechaLimite ) {
      setIsShowModalMobile(true);
    }
  }, [])

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

        {/* <Ofertas /> */}
      </div>
      <Footer />
      { isShowModalMobile && (
        <Popup 
          modalKey={ ModalEntities.mobile_purchase_info }
          modalClose={ () => setIsShowModalMobile(false) }
          modalMethods={ () => window.location.href = "https://www.pullmanbus.cl"}
        />) 
      }
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
