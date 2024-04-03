import { useRouter } from 'next/router';
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { liberarAsientos } from "store/usuario/compra-slice";
import { limpiarCambio } from "store/usuario/cambio-boleto-slice";

export const Content = (props, children) => {

    const router = useRouter();

    const dispatch = useDispatch();

    useEffect(() =>{ 
        if( !router.pathname.includes('respuesta-transaccion') ) {
            dispatch(liberarAsientos()) 
            dispatch(limpiarCambio())
        }
    }, [router.pathname]);

    return props.children;
}
