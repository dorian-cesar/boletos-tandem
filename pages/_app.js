import { AppProps } from 'next/app'
import { store } from 'store/store';
import { Provider, useDispatch } from 'react-redux'
import { SWRConfig } from 'swr'
import fetchJson from 'lib/fetchJson'
import 'bootstrap/dist/css/bootstrap.css'
import '../public/style.css'
import 'react-datepicker/dist/react-datepicker.min.css'
import '../public/custom.css'
import '../public/modal.css'
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from "react";
import { Titillium_Web } from 'next/font/google';
import { useRouter } from 'next/router';
import { Content } from './content';

const titillium = Titillium_Web({
  weight: ['400', '600', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap");
  }, []);

  return (
    <Provider store={store}>
      <SWRConfig
        value={{
          fetcher: fetchJson,
          onError: (err) => {
            console.error(err)
          },
        }}
      >
        <Content>
          <main className={titillium.className}>
            <Component {...pageProps} />
          </main>
        </Content>
      </SWRConfig>
    </Provider>
  )
}

export default MyApp
