import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

import Boleto from "././Boleto";
import Loader from "../Loader";

import { LiberarAsientoDTO, TomaAsientoDTO } from "dto/TomaAsientoDTO";
import { BuscarPlanillaVerticalDTO } from "dto/MapaAsientosDTO";
import { AsientoDTO } from "dto/AsientoDTO";
import { PasajeDTO } from "dto/PasajesDTO";

const ASIENTO_LIBRE = 'libre';
const ASIENTO_LIBRE_MASCOTA = 'pet-free';
const STAGE_BOLETO_IDA = 0;
const STAGE_BOLETO_VUELTA = 1;
const ASIENTO_TIPO_MASCOTA = 'pet';
const ASIENTO_TIPO_ASOCIADO = 'asociado';
const ASIENTO_OCUPADO = 'ocupado';
const MAXIMO_COMPRA_ASIENTO = 4;

const StagePasajes = (props) => {

    const { parrilla, stage, loadingParrilla, setParrilla, startDate, endDate, carro, setCarro, setStage, searchParrilla } = props;

    const [filter_tipo, setFilterTipo] = useState([]);
    const [filter_horas, setFilterHoras] = useState([]);
    const [openPane, setOpenPane] = useState(false);
    const [sort, setSort] = useState(null);
    const [mascota_allowed, setMascota] = useState(false);
    const [asientosIda, setAsientosIda] = useState([]);
    const [asientosVuelta, setAsientosVuelta] = useState([]);
    const [servicioIda, setServicioIda] = useState(null);
    const [servicioVuelta, setServicioVuelta] = useState(null);
    const [modalMab, setModalMab] = useState(false);

    function toggleTipo(tipo) {
        let listaTipoTemporal = [...filter_tipo];
        if (filter_tipo.includes(tipo)) {
            listaTipoTemporal = filter_tipo.filter((i) => i != tipo);
        } else {
            listaTipoTemporal.push(tipo);
        }
        setFilterTipo(listaTipoTemporal);
    };

    function toggleHoras(horas) {
        let listaHorasTemporal = [...filter_horas];
        if (filter_horas.includes(horas)) {
            listaHorasTemporal = listaHorasTemporal.filter((i) => i != horas);
        } else {
            listaHorasTemporal.push(horas);
        }
        setFilterHoras(listaHorasTemporal);
    };

    async function reloadPane(indexParrilla) {
        try {
            const parrillaTemporal = [...parrilla];
            const parrillaModificada = [...parrilla];
            const { data } = await axios.post('/api/mapa-asientos', 
                new BuscarPlanillaVerticalDTO(parrillaTemporal[indexParrilla], stage, startDate, endDate, parrilla[indexParrilla]));
            parrillaModificada[indexParrilla].loadingAsientos = false;
            parrillaModificada[indexParrilla].asientos1 = data[1];
            if( !!parrillaTemporal[indexParrilla].busPiso2 ) {
                parrillaModificada[indexParrilla].asientos2 = data[2];
            }
            setParrilla(parrillaModificada);
        } catch ({ message }) {
            console.error(`Error al recargar panel [${ message }]`);
        }
    };

    const tipos_servicio = parrilla.reduce((a, b) => {
        if (!a.includes(b.servicioPrimerPiso) && b.servicioPrimerPiso != "") {
            a.push(b.servicioPrimerPiso);
        }
        if (!a.includes(b.servicioSegundoPiso) && b.servicioSegundoPiso != "") {
            a.push(b.servicioSegundoPiso);
        }
        return a;
    }, []);

    async function servicioTomarAsiento(parrillaServicio, asiento, piso, asientosTemporal, isMascota = false) {
        try {
           const { data } = await axios.post('/api/tomar-asiento', new TomaAsientoDTO(parrillaServicio, startDate, endDate, asiento, piso, stage));
            const reserva = data;           
            if( reserva.estadoReserva ) {
                if( isMascota ) setModalMab(true);
                asientosTemporal.push(new AsientoDTO(reserva, parrillaServicio, asiento, piso))
                stage == STAGE_BOLETO_IDA ? setAsientosIda(asientosTemporal) : setAsientosVuelta(asientosTemporal);
                return asientosTemporal;
            }
        } catch ({ message }) {
            throw new Error(`Error al reservar asociado/mascota [${ message }]`);
        }
    }

    async function servicioLiberarAsiento(parrillaServicio, asiento, piso, codigoReserva) {
        try {
            const { data } = await axios.post('/api/liberar-asiento', new LiberarAsientoDTO(parrillaServicio, startDate, endDate, asiento, piso, stage, codigoReserva))
            return data;
        } catch ({ message }) {
            throw new Error(`Error al liberar asiento [${ message }]`);
        }
    }

    function validarMaximoAsientos(asientos) {
        if( asientos.length >= MAXIMO_COMPRA_ASIENTO ) {
            toast.warn(`Máximo ${ MAXIMO_COMPRA_ASIENTO } pasajes`, {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false
            });
            return false;
        }
        return true;
    }
    
    async function tomarAsiento(asiento, viaje, indexParrilla, piso) {
        try {
            let asientosTemporal = stage == STAGE_BOLETO_IDA ? [...asientosIda] : [...asientosVuelta];
            const asientoSeleccionado = asientosTemporal.find((asientoBusqueda) => asiento.asiento == asientoBusqueda.asiento);

            if( asiento.estado == ASIENTO_LIBRE || asiento.estado == ASIENTO_LIBRE_MASCOTA ) {
                if( !validarMaximoAsientos(asientosTemporal) ) return;
                asientosTemporal = await servicioTomarAsiento(parrilla[indexParrilla], asiento.asiento, piso, asientosTemporal);

                if( asiento.tipo == ASIENTO_TIPO_ASOCIADO || asiento.tipo == ASIENTO_TIPO_MASCOTA ) {
                    asientosTemporal = await servicioTomarAsiento(parrilla[indexParrilla], asiento.asientoAsociado, piso, asientosTemporal, true);
                }

                await reloadPane(indexParrilla);
            }

            if( asiento.estado == ASIENTO_OCUPADO && asientoSeleccionado ) {
                await servicioLiberarAsiento(parrilla[indexParrilla], asiento.asiento, asientoSeleccionado.codigoReserva);
                
                if( asiento.tipo == ASIENTO_TIPO_ASOCIADO || asiento.tipo == ASIENTO_TIPO_MASCOTA ) {
                    await servicioLiberarAsiento(parrilla[indexParrilla], asiento.asientoAsociado, piso, asientoSeleccionado.codigoReserva);
                }

                await reloadPane(indexParrilla);
                asientosTemporal = asientosTemporal.filter((asientoBusqueda) => asientoBusqueda.asiento != asiento.asiento);
                if( asiento.tipo == ASIENTO_TIPO_ASOCIADO || asiento.tipo == ASIENTO_TIPO_MASCOTA ) {
                    asientosTemporal = asientosTemporal.filter(({ asiento }) => asiento != asiento.asientoAsociado);
                }
            }

            if( stage == STAGE_BOLETO_IDA ) {
                setAsientosIda(asientosTemporal);
                setServicioIda(parrilla[indexParrilla]);
            } else {
                setAsientosVuelta(asientosTemporal);
                setServicioVuelta(parrilla[indexParrilla]);
            }
        } catch ({ message }) {
            console.error(`Error al tomar asiento [${ message }]`);
        }
    };

    async function liberarAsientosPanel() {
        if( stage == STAGE_BOLETO_IDA ) {
            asientosIda.forEach(async (asientoIda) => await servicioLiberarAsiento(servicioIda, asientoIda.asiento, asientoIda.piso, asientoIda.codigoReserva));
            setAsientosIda([]);
        }
        if( stage == STAGE_BOLETO_VUELTA ) {
            asientosVuelta.forEach(async (asientoVuelta) => await servicioLiberarAsiento(servicioVuelta, asientoVuelta.asiento, asientoVuelta.piso, asientoVuelta.codigoReserva));
            setAsientosVuelta([]);
        }
    }

    async function setOpenPaneRoot(indexParrilla) {
       
        try {
            // ╰(*°▽°*)╯
            const parrillaTemporal = [...parrilla];
            const parrillaModificada = [...parrilla];
            parrillaTemporal[indexParrilla].loadingAsientos = true;
            await liberarAsientosPanel();
            setParrilla(parrillaTemporal);
            stage == STAGE_BOLETO_IDA ? setAsientosIda([]) : setAsientosVuelta([]);
            if( parrilla[indexParrilla].id == openPane ) {
                setOpenPane(null);
                return;
            }
            setOpenPane(parrilla[indexParrilla].id);
            const { data } = await axios.post('/api/mapa-asientos', 
            new BuscarPlanillaVerticalDTO(parrillaTemporal[indexParrilla], stage, startDate, endDate, parrilla[indexParrilla]));
            console.log('mapa asiento', data)
            parrillaModificada[indexParrilla].loadingAsientos = false;
            parrillaModificada[indexParrilla].asientos1 = data[1];
            if( !!parrillaTemporal[indexParrilla].busPiso2 ) {
                parrillaModificada[indexParrilla].asientos2 = data[2];
            }
            setParrilla(parrillaModificada);
        } catch ({ message }) {
            console.error(`Error al abrir el panel [${ message }]`);
        }
    };

    function setPasaje(pasaje) {
        try {
            let carroTemporal = { ...carro };
            if (stage == STAGE_BOLETO_IDA) {
                carroTemporal.clientes_ida = asientosIda.map((asientoIdaMapped, asientoIdaIndex) => new PasajeDTO(pasaje, asientoIdaMapped, asientoIdaIndex == 0 ? true : false));
                carroTemporal.pasaje_ida = pasaje;
                setStage(1);
                setCarro(carroTemporal);
                setOpenPane(null);
                searchParrilla(1);
            }
            if (stage == STAGE_BOLETO_VUELTA) {
                carroTemporal.clientes_vuelta = asientosVuelta.map((asientoVueltaMapped, asientoVueltaIndex) => new PasajeDTO(pasaje, asientoVueltaMapped, asientoVueltaIndex == 0 ? true : false));
                carroTemporal.pasaje_vuelta = pasaje;
                setStage(2);
                setCarro(carroTemporal);
            }
        } catch ({ message }) {
            console.error(`Error al guardar pasaje [${ message }]`);
        }
    };

    function returnSortedParrilla() {
        return parrilla.sort((prevValue, actValue) => {
            if(!sort) return 1;
            
            if( sort == 'precio-up' ) return (prevValue.tarifaPrimerPisoInternet - actValue.tarifaPrimerPisoInternet);

            if( sort == 'precio-down' ) return (actValue.tarifaPrimerPisoInternet - prevValue.tarifaPrimerPisoInternet);

            if( sort == 'hora-up' ) return (Number(prevValue.horaSalida.replace(':', '')) - Number(actValue.horaSalida.replace(':', '')));

            return (Number(actValue.horaSalida.replace(':', '')) - Number(prevValue.horaSalida.replace(':', '')));
        })
    }

    function returnMappedParrilla() {
        return returnSortedParrilla().map((mappedParrilla, indexParrilla) => {
            if ( filter_tipo.length > 0 && !filter_tipo.includes(mappedParrilla.servicioPrimerPiso) && !filter_tipo.includes(mappedParrilla.servicioSegundoPiso)) return;

            if ( mascota_allowed && mappedParrilla.mascota == 0 ) return;
            
            if ( filter_horas.length > 0 ) {
                let isTime = filter_horas.reduce((prevValue, actValue) => {
                    if ( !prevValue ) {
                        let horaFiltro = actValue.split('-');
                        let horaViaje = mappedParrilla.horaSalida.split('-');
                        if( horaViaje[0] <= horaFiltro[1] && horaViaje[0] <= horaFiltro[0] ) {
                            prevValue= true;
                        }
                        return prevValue;
                    }
                }, false);
                if (!isTime) return;
            }

            return (
                <Boleto
                    key={ `key-boleto-${ indexParrilla }`}
                    {...mappedParrilla }
                    k={ indexParrilla }
                    openPane={ openPane }
                    asientos_selected={ stage == STAGE_BOLETO_IDA ? asientosIda : asientosVuelta }
                    stage={ stage }
                    setPasaje={ setPasaje }
                    tomarAsiento={ tomarAsiento }
                    setOpenPane={ setOpenPaneRoot }/>
            );
        });
    }

    return (
        
        <div className="row">
            <div className="col-12 col-md-3" key={stage + "it"}>
                <div className="container-filtro">
                    <h2 className="container-title">Filtrar por:</h2>
                    <div className="w-100 mb-4">
                        <span className="container-sub-title">Tipo de servicio</span>
                        {
                            tipos_servicio.map((tipoServicioMapped, indexTipoServicio) => {
                                if (tipoServicioMapped !== undefined && tipoServicioMapped !== '') {
                                    return (
                                        <div key={ `tipo-servicio-${ indexTipoServicio }` } className="custom-control custom-checkbox">
                                            <input 
                                                key={ `check-${ tipoServicioMapped }-key` }
                                                type="checkbox" 
                                                className="custom-control-input" 
                                                id={"tipoCheck" + indexTipoServicio}
                                                onClick={ () => toggleTipo(tipoServicioMapped) }
                                                defaultValue={ tipoServicioMapped }
                                                defaultChecked={ filter_tipo.includes(tipoServicioMapped) }/>
                                            <label
                                                className="custom-control-label"
                                                htmlFor={ "tipoCheck" + indexTipoServicio }>
                                                &nbsp;{ tipoServicioMapped }
                                            </label>
                                        </div>
                                    );
                                } else {
                                    return null; 
                                }

                            })
                            
                        }
                    </div>
                    <div className="w-100 mb-4">
                        <span className="container-sub-title">Horarios</span>
                        <div className="custom-control custom-checkbox">
                            <input
                                id="horaCheck1"
                                type="checkbox"
                                className="custom-control-input"
                                defaultChecked={ filter_horas.includes("6-12") }
                                onClick={ () => toggleHoras("6-12") }/>
                            <label
                                className="custom-control-label"
                                htmlFor={"horaCheck1"}>
                                &nbsp;6:00 AM a 11:59 AM
                            </label>
                        </div>
                        <div className="custom-control custom-checkbox">
                            <input
                                id="horaCheck2"
                                type="checkbox"
                                className="custom-control-input"
                                defaultChecked={ filter_horas.includes("12-20") }
                                onClick={ () => toggleHoras("12-20") }/>
                            <label
                                className="custom-control-label"
                                htmlFor="horaCheck2">
                                &nbsp;12 PM a 19:59 PM
                            </label>
                        </div>
                        <div className="custom-control custom-checkbox">
                            <input
                                id="horaCheck3"
                                type="checkbox"
                                className="custom-control-input"
                                defaultChecked={ filter_horas.includes("20-6") }
                                onClick={() => toggleHoras("20-6") }/>
                            <label
                                className="custom-control-label"
                                htmlFor="horaCheck3">
                                &nbsp;20:00 PM en adelante
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 col-md-9">
                { loadingParrilla ? <Loader /> : parrilla.length > 0 ? returnMappedParrilla() : 
                    <h5 className="p-2">
                        Lo sentimos, no existen
                        resultados para su búsqueda
                    </h5>
                }
            </div>
        </div>
        
    )
}

export default StagePasajes;