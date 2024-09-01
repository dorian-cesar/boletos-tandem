import Footer from 'components/Footer';
import Layout from 'components/Layout';
import cookie from 'cookie';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ErrorTransaccion() {
    const [transactionCodeStr, setTransactionCodeStr] = useState<string>('');

    useEffect(() => {
        try {
            const cookies = cookie.parse(document.cookie || '');
            const code = cookies.transactionCode || '';
            setTransactionCodeStr(code);
        } catch (error) {
            console.error('Error parsing cookie:', error);
        }
    }, []);

    return (
        <Layout>
            <div className="container row d-flex justify-content-center mb-5 w-100 mx-auto">
                <div className="text-center mt-5">
                    <h1>Lo sentimos 😢,</h1>
                    <h2>no se pudo llevar a cabo la transacción</h2>
                    <h2>de tu compra.</h2>
                </div>
                <div className="text-center my-2">
                    <h5>Por favor, intentelo nuevamente.</h5>
                </div>
                <div className="mt-5 mb-5 col-lg-4">
                    <Link className="btn-outline" href="/">
                        Salir
                    </Link>
                </div>
            </div>
            <Footer />
        </Layout>
    )
}