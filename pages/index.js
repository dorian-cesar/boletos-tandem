// import Layout from "components/Layout";
// import Head from "next/head";
// import { registerLocale } from "react-datepicker";
// import React, { useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import { liberarAsientos } from "store/usuario/compra-slice";
// import { limpiarCambio } from "store/usuario/cambio-boleto-slice";
// // import Ofertas from "components/Ofertas/Ofertas";

// import Banner from "components/banner";

// import Popup from "components/Popup/Popup";

// import ModalEntities from "entities/ModalEntities";

// import es from "date-fns/locale/es";
// import dynamic from "next/dynamic";
// import PopupInformativo from "../components/PopupInformativo/PopupInformativo";
// import Script from "next/script";

// registerLocale("es", es);

// const DynamicBusquedaServicioComponent = dynamic(
//   () => import("components/BusquedaServicio/BusquedaServicio"),
//   {
//     ssr: false,
//   }
// );

// const DynamicFooterComponent = dynamic(() => import("components/Footer"), {
//   ssr: false,
// });

// export default function Home(props) {
//   const origenes = props.ciudades;
//   const dispatch = useDispatch();

//   const [isShowModalMobile, setIsShowModalMobile] = useState(false);

//   useEffect(() => {
//     dispatch(liberarAsientos());
//     dispatch(limpiarCambio());
//   }, []);

//   useEffect(() => {
//     const fechaLimite = new Date(2024, 11, 8, 23, 59, 59);
//     if (new Date() <= fechaLimite) {
//       setIsShowModalMobile(true);
//     }
//   }, []);

//   // return (
//   //     <Layout>
//   //         <Head>
//   //             <title>Tandem | Inicio</title>
//   //         </Head>
//   //         <div className="home">
//   //             <Banner/>
//   //             <DynamicBusquedaServicioComponent
//   //                 origenes={origenes}
//   //                 dias={props.dias}
//   //                 // isShowMascota={true}
//   //             />

//   //             {/* <Ofertas /> */}
//   //         </div>
//   //         <DynamicFooterComponent/>
//   //         {isShowModalMobile && (
//   //             <PopupInformativo
//   //                 modalClose={() => setIsShowModalMobile(false)}
//   //             />)
//   //         }
//   //     </Layout>
//   // );

//   return (
//     <Layout>
//       <Head>
//         <title>Tandem | Inicio</title>
//       </Head>

//       <Banner origenes={origenes} dias={props.dias} />

//       <DynamicFooterComponent />

//       {isShowModalMobile && (
//         <PopupInformativo modalClose={() => setIsShowModalMobile(false)} />
//       )}
//     </Layout>
//   );
// }

"use client";

import Layout from "components/Layout";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { liberarAsientos } from "store/usuario/compra-slice";
import { limpiarCambio } from "store/usuario/cambio-boleto-slice";
import Banner from "components/banner";
import dynamic from "next/dynamic";
import Login from "components/Login/Login";
import { decryptData } from "utils/encrypt-data";
import LocalStorageEntities from "entities/LocalStorageEntities";

const DynamicFooterComponent = dynamic(() => import("components/Footer"), {
  ssr: false,
});
const DynamicBusquedaServicioComponent = dynamic(
  () => import("components/BusquedaServicio/BusquedaServicio"),
  { ssr: false }
);

export default function Home(props) {
  const dispatch = useDispatch();
  const [isLogged, setIsLogged] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    dispatch(liberarAsientos());
    dispatch(limpiarCambio());
  }, []);

  useEffect(() => {
    // Solo se ejecuta en el cliente
    const token = decryptData(LocalStorageEntities.user_token);
    if (token) {
      setIsLogged(true);
    }
    setCheckingAuth(false);
  }, []);

  if (checkingAuth) return null; // Mientras revisamos token

  // Si no hay token, mostrar modal de login
  if (!isLogged) {
    return <Login onLoginSuccess={() => setIsLogged(true)} />;
  }

  return (
    <Layout>
      <Head>
        <title>Tandem | Inicio</title>
      </Head>

      <Banner origenes={props.ciudades} dias={props.dias} />
      {/* <DynamicBusquedaServicioComponent origenes={props.ciudades} dias={props.dias} /> */}
      <DynamicFooterComponent />
    </Layout>
  );
}
