import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

import Cuponera from "./Cuponera";
import Loader from "../Loader";

import { BuscarPlanillaVerticalDTO } from "dto/MapaAsientosDTO";

const StagePasajesCuponera = (props) => {
    const { parrillaCuponera, stage, loadingParrilla, setParrillaCuponera, startDate, endDate, carro, setCarro, setStage, datosCuponera ,searchParrilla, setCuponeraCompra } = props;
    const [openPane, setOpenPane] = useState(false);
    const [sort, setSort] = useState(null);
    const [modalMab, setModalMab] = useState(false);


    async function setOpenPaneRoot(indexParrilla) {
       
        try {
         
        } catch ({ message }) {
            console.error(`Error al abrir el panel [${ message }]`);
        }
    };

    function setCuponera(pasaje) {
        try {
            let carroTemporal = { ...carro };
            carroTemporal.pasaje_ida = pasaje;
            carroTemporal.cuponeraCompra = pasaje;
            setStage(1);
            setCarro(carroTemporal);
            setOpenPane(null);
            searchParrilla(1);
        } catch ({ message }) {
            console.error(`Error al guardar cuponera a comprar [${ message }]`);
        }
    };

    function returnSortedParrilla() {
        return parrillaCuponera.sort((prevValue, actValue) => {
            if(!sort) return 1;
            
            if( sort == 'precio-up' ) return (prevValue.tarifaPrimerPisoInternet - actValue.tarifaPrimerPisoInternet);

            if( sort == 'precio-down' ) return (actValue.tarifaPrimerPisoInternet - prevValue.tarifaPrimerPisoInternet);

            if( sort == 'hora-up' ) return (Number(prevValue.horaSalida.replace(':', '')) - Number(actValue.horaSalida.replace(':', '')));

            return (Number(actValue.horaSalida.replace(':', '')) - Number(prevValue.horaSalida.replace(':', '')));
        })
    }

    function returnMappedParrilla() {
        return returnSortedParrilla().map((mappedParrilla, indexParrilla) => {
            return (
                <Cuponera
                    key={ `key-boleto-${ indexParrilla }`}
                    {...mappedParrilla }
                    k={ indexParrilla }
                    openPane={ openPane }
                    stage={ stage }
                    setCuponera={ setCuponera }
                    setOpenPane={ setOpenPaneRoot }
                    cuponeraDatos={ datosCuponera }
                    setCuponeraCompra={setCuponeraCompra} />
            );
        });
    }

    return (
        
        <div className="row">
           
            <div className="col-12 col-md-12">
                <div className="bloque-header">
                    <div className="row">
                        <div
                            className="col-4 text-center"
                            onClick={ () => setSort(sort == "precio-up" ? "precio-down": "precio-up")}>
                            <span>
                                <img className="mr-2" src="img/icon-peso.svg" alt=""/>
                                Rango de Precio &nbsp;
                                { sort != '' ? 
                                    <img 
                                        src='img/icon-flecha-arriba.svg'
                                        alt=""
                                        className={ sort == 'precio-down' ? 'rotate-icon' : '' }/> 
                                    : '' 
                                }
                            </span>
                        </div>
                        <div
                            className="col-4 text-center"
                            onClick={() => setSort(sort == "hora-up" ? "hora-down" : "hora-up")}>
                            <span>
                                <img className="mr-2" src="img/icon-hora.svg" alt=""/>
                                Horario de salida &nbsp;
                                { sort != '' ? 
                                    <img 
                                        src='img/icon-flecha-arriba.svg'
                                        alt=""
                                        className={ sort == 'hora-up' ? 'rotate-icon' : '' } /> 
                                    : '' 
                                }
                            </span>
                        </div>
                        <div className="col-4">
                        
                        </div>
                    </div>
                </div>
                { loadingParrilla ? <Loader /> : parrillaCuponera.length > 0 ? returnMappedParrilla() : 
                    <h5 className="p-2">
                        Lo sentimos, no existen
                        resultados para su búsqueda
                    </h5>
                }
            </div>
        </div>
        
    )
}

export default StagePasajesCuponera;