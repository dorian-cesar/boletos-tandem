import axios from "axios";
import Layout from "components/Layout";
import Footer from "components/Footer";
import BusquedaServicio from "components/BusquedaServicio";
import Ofertas from "components/Ofertas";
import Cuponera from "pages/cuponera";
import Head from "next/head";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import getConfig from "next/config";
import { registerLocale } from "react-datepicker";
import React, { useState, useEffect } from "react";

const { publicRuntimeConfig } = getConfig();
import es from "date-fns/locale/es";

registerLocale("es", es);

export default function Home(props) {
  const origenes = props.ciudades;

  const imageUrls = [
    "https://pullman.cl/imagenes/fenix/banner/banner-1.png",
    "https://pullman.cl/imagenes/fenix/banner/banner-2.png",
    "https://pullman.cl/imagenes/fenix/banner/banner-3.png",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    }, 8000);
    return () => clearInterval(intervalId);
  }, []);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length
    );
  };
  
  return (
    <Layout>
      <Head>
        <title>PullmanBus | Inicio</title>
      </Head>
      <div className="home">
        <div className="img-principal d-none d-md-block">
          <img src="https://pullman.cl/imagenes/fenix/banner/banner-2.png" />
        </div>
        <div className="img-principal d-block d-md-none">
          <img src="/banner-mobile.png" />
        </div>
        <BusquedaServicio
          origenes={origenes}
          dias={props.dias}
          isShowMascota={true}
        />
        
        <Ofertas />
  
        {

          /*  <div className="img-principal d-none d-md-block">
        <Cuponera />
        </div> */
        }
       
        
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
