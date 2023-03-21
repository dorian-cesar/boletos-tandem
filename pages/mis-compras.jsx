import axios from "axios";
import Layout from "components/Layout";
import { useEffect, useState } from "react";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useForm } from "/hooks/useForm";
import Head from "next/head";

const MisCompras = () => {
  const router = useRouter()
  const { getItem } = useLocalStorage();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let checkUser = getItem("user");
    if (checkUser == null) router.push("/");
    setUser(checkUser);
    setIsLoading(false);
  }, []);

  return (
    <>
      <Layout>
        <Head>
          <title>PullmanBus | Mis compras</title>
        </Head>
        {isLoading ? (
          <div className="d-flex justify-content-center mt-2">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden"></span>
            </div>
          </div>
        ) : (
          <>
            <div className="pullman-mas">
              <div className="container">
                <div className="row py-4">
                  <div className="col-12">
                    <span>Home &gt; Mis compras </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="row pb-5">
                <div className="d-flex justify-content-center">
                    <div className="col-12 col-md-8 bloque flex-column">
                        <h1 className="titulo-azul text-center">
                            Historial de compras
                        </h1>
                        <div className="d-flex justify-content-center mt-2 mb-4">
                            <a href="/">Volver</a>
                        </div>
                        <table className="table table-striped">
                        <thead>
                            <tr>
                            <th scope="col">Código transacción</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Fecha compra</th>
                            <th scope="col">Total</th>
                            <th scope="col"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                            <th scope="row">1</th>
                            <td>Mark</td>
                            <td>Otto</td>
                            <td>@mdo</td>
                            </tr>
                            <tr>
                            <th scope="row">2</th>
                            <td>Jacob</td>
                            <td>Thornton</td>
                            <td>@fat</td>
                            </tr>
                            <tr>
                            <th scope="row">3</th>
                            <td colspan="2">Larry the Bird</td>
                            <td>@twitter</td>
                            </tr>
                        </tbody>
                        </table>
                    </div>
                </div>
            </div>
          </>
        )}
      </Layout>
    </>
  );
};

export default MisCompras;
