import { AppProps } from "next/app";
import { store } from "store/store";
import { Provider } from "react-redux";
import { SWRConfig } from "swr";
import fetchJson from "lib/fetchJson";

import "bootstrap/dist/css/bootstrap.css";
import "../scss/globals.scss";
import "react-toastify/dist/ReactToastify.css";

import "../public/style.css";
import "../public/react-datepicker.css";
import "../public/custom.css";
import "../public/modal.css";
import { useEffect } from "react";
import { Titillium_Web } from "next/font/google";
import 'tippy.js/dist/tippy.css';

const titillium = Titillium_Web({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap");
  }, []);

  return (
    <Provider store={store}>
      <SWRConfig
        value={{ fetcher: fetchJson, onError: (err) => console.error(err) }}
      >
        <main className={titillium.className}>
          <Component {...pageProps} />
        </main>
        <style jsx global>{`
          :root {
            --font-titillium: ${titillium.style.fontFamily};
          }
          body {
            font-family: ${titillium.style.fontFamily};
          }
          [class*="placeholder"] {
            font-family: inherit !important;
          }
        `}</style>
      </SWRConfig>
    </Provider>
  );
}

export default MyApp;
