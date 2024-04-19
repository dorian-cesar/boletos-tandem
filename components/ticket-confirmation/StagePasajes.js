import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import Boleto from './Boleto/Boleto';
import Loader from "../Loader";

import { BuscarPlanillaVerticalDTO } from "dto/MapaAsientosDTO";
import { PasajeDTO } from "dto/PasajesDTO";
import { FiltroServicios } from "./FiltroServicios/FiltroServicios";
import moment from "moment";


const STAGE_BOLETO_IDA = 0;
const STAGE_BOLETO_VUELTA = 1;

const StagePasajes = (props) => {

    const { parrilla, stage, loadingParrilla, setParrilla, startDate, endDate, carro, setCarro, setStage, searchParrilla, boletoValido } = props;

    const [filter_tipo, setFilterTipo] = useState([]);
    const [filter_horas, setFilterHoras] = useState([]);
    const [filter_mascota, setFilterMascota] = useState([]);
    const [openPane, setOpenPane] = useState(false);
    const [sort, setSort] = useState(null);
    const [asientosIda, setAsientosIda] = useState([]);
    const [asientosVuelta, setAsientosVuelta] = useState([]);
    const [servicios, setServicios] = useState(null);
    const [cantidadIda, setCantidadIda] = useState(0);

    const toggleTipo = useCallback((tipo) => {
        let listaTipoTemporal = [...filter_tipo];
        if (filter_tipo.includes(tipo)) {
            listaTipoTemporal = filter_tipo.filter((i) => i != tipo);
        } else {
            listaTipoTemporal.push(tipo);
        }
        setFilterTipo(listaTipoTemporal);
    }, [filter_tipo]);

    const toggleHoras = useCallback((horas) => {
        let listaHorasTemporal = [...filter_horas];
        if (filter_horas.includes(horas)) {
            listaHorasTemporal = listaHorasTemporal.filter((i) => i != horas);
        } else {
            listaHorasTemporal.push(horas);
        }
        setFilterHoras(listaHorasTemporal);
    }, [filter_horas]);

    const tipos_servicio = parrilla.reduce((a, b) => {
        if (!a.includes(b.servicioPrimerPiso) && b.servicioPrimerPiso != "") {
            a.push(b.servicioPrimerPiso);
        }
        if (!a.includes(b.servicioSegundoPiso) && b.servicioSegundoPiso != "") {
            a.push(b.servicioSegundoPiso);
        }
        return a;
    }, []);


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
            const { data } = await axios.post('/api/ticket_sale/mapa-asientos', 
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
        let sortedParrilla = [];
        returnSortedParrilla().map((mappedParrilla, indexParrilla) => {
            if ( filter_tipo.length > 0 && !filter_tipo.includes(mappedParrilla.servicioPrimerPiso) && !filter_tipo.includes(mappedParrilla.servicioSegundoPiso)) return;
            
            if (filter_horas.length > 0) {
                const horaSalida = moment(mappedParrilla.horaSalida, 'hh:mm');
            
                let isTime = filter_horas.some(horaFiltro => {
                    let [inicio, fin] = horaFiltro.split('-');
                    const horaInicio = moment(inicio, 'hh:mm');
                    const horaFin = moment(fin, 'hh:mm');
                    
                    return horaSalida >= horaInicio && horaSalida <= horaFin;
                });
            
                if (!isTime) return;
            }

            if ( mappedParrilla.mascota === '1' ) return;

            sortedParrilla.push(
                <Boleto
                    key={ `key-boleto-${ indexParrilla }`}
                    {...mappedParrilla }
                    thisParrilla={ mappedParrilla }
                    k={ indexParrilla }
                    asientos_selected={ stage == STAGE_BOLETO_IDA ? asientosIda : asientosVuelta }
                    stage={ stage }
                    setPasaje={ setPasaje }
                    setOpenPane={ setOpenPaneRoot }
                    parrilla={parrilla}
                    setParrilla={setParrilla}
                    boletoValido={boletoValido}/>
            );
        });

        debugger;

        if( sortedParrilla.length > 0 ) {
            setServicios(sortedParrilla)
        } else {
            setServicios(
                <h5 className="p-2 empty-grill">
                    Lo sentimos, no existen
                    resultados para su búsqueda, 
                    busque en otro horario
                </h5>
            )
        }
    }

    useEffect(() => {
        returnMappedParrilla();
    }, [toggleTipo, toggleHoras, parrilla])

    return (
        <div className="d-flex justify-content-center">
            <FiltroServicios 
                tipos_servicio={ tipos_servicio }
                filter_tipo={ filter_tipo }
                filter_horas={ filter_horas }
                filter_mascota={ filter_mascota }
                stage={ stage }
                toggleTipo={ toggleTipo }
                toggleHoras={ toggleHoras }
            />
            <div>
                { loadingParrilla ? <div className="empty-grill"><Loader/></div> : parrilla.length > 0 ? servicios : 
                    <h5 className="p-2">
                        Lo sentimos, no existen
                        resultados para su búsqueda, 
                        busque en otro horario
                    </h5>
                }
                { parrilla.length < 0 && <div className="empty-grill"></div> }
            </div>
        </div>
        
    )
}

export default StagePasajes;