import doLogin from '../../../utils/oauth-token';
import getConfig from 'next/config'
import axios from "axios"
const {serverRuntimeConfig} = getConfig();
const config = serverRuntimeConfig;

import cookie from 'cookie';
import JWT from 'jsonwebtoken';

const secret = 'xWL!96JRaWi2lT0jG';

async function endTransaction(token, codigo) {
    let carro;
    try {
        carro = await axios.post(config.site_url + "/api/carro", {
            token_ws: token, 
            codigo
        });
    } catch (error) {
        console.log('ERROR:::', error);
    }
    return carro;
}

export default async (req, res) => {
    try {
        debugger;
        const { codigo, token_ws } = req.query;

        const { data } = await endTransaction(token_ws, codigo);
        const { carro, cerrar, commit } = data;

        // TODO: condicionar a que ventana debe ir segun el estado de la transaccion
        if( commit && commit.status === 'AUTHORIZED' ){
            const signedToken = JWT.sign({ carro: carro, transactionCode: req.query.codigo }, secret, { 
                algorithm: 'HS256',
                expiresIn: '1h'
            });
            res.setHeader('Set-Cookie', cookie.serialize('transactionInfo', signedToken), {
                secure: process.env.NODE_ENV !== 'development',
                maxAge: 60 * 60, // 1 hour
                sameSite: 'strict',
                path: '/'
            });
            res.redirect('/respuesta-transaccion-v2');
        } else {
            res.setHeader('Set-Cookie', cookie.serialize('transactionCode', JSON.stringify({ transactionCode: req.query.codigo }), {
                secure: process.env.NODE_ENV !== 'development',
                maxAge: 60 * 60, // 1 hour
                sameSite: 'strict',
                path: '/'
            }));
            res.redirect('/error-transaccion');
        }
    } catch(error){
        console.error('ERROR:::', error);
        res.setHeader('Set-Cookie', cookie.serialize('transactionCode', req.query.codigo, {
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 60 * 60, // 1 hour
            sameSite: 'strict',
            path: '/'
        }));
        res.redirect('/error-transaccion');
    }
    
}   