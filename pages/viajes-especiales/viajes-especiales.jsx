
import Layout from "../../components/Layout";
import Footer from "../../components/Footer";
import styles from "./viajes-especiales.module.css"
import es from "date-fns/locale/es";


registerLocale("es", es);

export default function Home(props) {

  return (
    <Layout>
      <Head>
        <title>Pullman Bus | Viaje Especiale</title>
      </Head>
      <h1>aquii</h1>
      
      <ToastContainer />
      <Footer />
    </Layout>
  );
}


