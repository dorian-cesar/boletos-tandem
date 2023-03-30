import { AppProps } from 'next/app'
import { SWRConfig } from 'swr'
import fetchJson from 'lib/fetchJson'
import 'bootstrap/dist/css/bootstrap.css'
import '../public/style.css'
import 'react-datepicker/dist/react-datepicker.min.css'
import '../public/custom.css'
import '../public/modal.css'
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from "react";
function MyApp({ Component, pageProps }) {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap");
  }, []);
  return (
    <SWRConfig
      value={{
        fetcher: fetchJson,
        onError: (err) => {
          console.error(err)
        },
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  )
}

export default MyApp
