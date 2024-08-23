import Footer from 'components/Footer';
import Layout from 'components/Layout';
import { useEffect, useState } from 'react';

import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import Image from 'next/image';
import axios from 'axios';
import getConfig from 'next/config';
import { useRouter } from 'next/router';

import { redirect } from 'next/navigation';

const { publicRuntimeConfig } = getConfig();

import JWT from 'jsonwebtoken';

interface ConfirmTransactionProps {
    serviceResponse: any;
}

const SECRET = 'xWL!96JRaWi2lT0jG';

export default function ConfrimTransaction({ serviceResponse }:ConfirmTransactionProps) {

    const router = useRouter();

    useEffect(() => {
        debugger;
        if( !serviceResponse ) {
            router.push('/error-transaccion');
            return;
        }

        if( serviceResponse && serviceResponse.cerrar && serviceResponse.cerrar.estado ) {
            const token = JWT.sign(serviceResponse, SECRET);
            sessionStorage.setItem('transactionInformation', token);
            router.push('/respuesta-transaccion-v2', );
            return;
        }
        
        router.push('/error-transaccion');
    }, []);

    return (
        <Layout>
            <div className="container row d-flex justify-content-center mb-5 w-100 mx-auto">
                <div className="text-center mt-2">
                    <Image
                        src="/img/loading.gif"
                        width={300}
                        height={300}
                        alt="Picture of the author"/>
                </div>
                <div className="text-center my-2">
                    <h5>Estamos completando su transacción, por favor espere.</h5>
                </div>
            </div>
            <Footer />
        </Layout>
    )
}

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const { codigo, token_ws } = context.query;

    let serviceResponse = {};
    try {
        const { data } = await axios.post(publicRuntimeConfig.site_url + '/api/v2/confirm-transaction', {
            codigo,
            token_ws,
        });
        serviceResponse = data;
    } catch(error) {
        console.log('Error:', error);
    }

    return {
      props: {
        serviceResponse
      },
    };
  }, sessionOptions);
  