import axios from 'axios';
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

export const convenio = () => {

    const [convenios, setConvenios] = useState([]);
    const [detalleConvenio, setDetalleConvenio] = useState([]);
    const [validarConvenio, setValidarConvenio] = useState({});

    /**Trae la lista de convenios*/
    async function obtenerConvenios() {
        try {
            const response = await axios.post(
                "/api/covenio/obtener-convenios",
            );
            const convenios = response.data?.Convenio;
            setConvenios(convenios);
        } catch (error) {}
    }

    /**Trae los atributos del convenio a usar */
    async function obtenerDetalleConvenioAtributo(idConvenio:any) {
        try {
            let body = {
                "idConvenio" : idConvenio
            }
            const response = await axios.post(
                "/api/covenio/obtener-detalle-convenio", body
            );
            const detalle = response.data;
            setDetalleConvenio(detalle);
        } catch (error) {}
    }

    /**Valida el usuario con el convenio */
    async function validarConvenioUsuario() {
        try {
            let body = {
                "atributo" : "",
                "idConvenio" : ""
            }
            const response = await axios.post(
                "/api/covenio/validar-convenio", body
            );
            const validar = response.data;
            setValidarConvenio(validar);
        } catch (error) {}
    }

    useEffect(() => {
        obtenerConvenios();
      }, []);
    
  return (
    <div>convenio</div>
  )
}
