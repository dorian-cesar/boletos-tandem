import React, { useEffect, useState } from 'react'

import { encryptDataNoSave } from "utils/encrypt-data";

import { format } from "@formkit/tempo";
import dayjs from "dayjs";
import { useRouter } from 'next/router';
import BusquedaServicio from 'components/BusquedaServicio/BusquedaServicio';

type City = {
    codigo: string;
    nombre: string;
}

type MobileSearchBarProps = {
    startDate: Date;
    endDate: Date;
    origin: City;
    destination: City;
    stage: number;
    petAllowed: boolean;
}

export default function MobileSearchBar(props:MobileSearchBarProps) {

    const [activeDate, setActiveDate] = useState(props.startDate || new Date());
    const [prevDate, setPrevDate] = useState<Date | null>(null);
    const [nextDate, setNextDate] = useState<Date | null>(null);

    const router = useRouter();

    const updateDates = () => {
        if (activeDate) {
            const prev = new Date(activeDate);
            const next = new Date(activeDate);

            prev.setDate(prev.getDate() - 1);
            next.setDate(next.getDate() + 1);

            setPrevDate(prev);
            setNextDate(next);
        }
    };

    useEffect(() => {
        updateDates();
    }, [activeDate]);

    useEffect(() => {
        if (props.startDate) {
            setActiveDate(props.startDate);
        }
    }, [props.startDate]);

    const checkDate = (date:Date) => {
        const hoy = dayjs();
        const checkDate = dayjs(date);
        let startDate = props.startDate ? dayjs(props.startDate) : null;
        let endDate = props.endDate ? dayjs(props.endDate) : null;
    
        // Verificar si la fecha es válida para habilitar el botón
        if (props.stage === 0) {
            // startDate debe ser válido y no menor que hoy
            const isStartDateValid = checkDate.isAfter(hoy) || checkDate.isSame(hoy, 'day');
            // endDate debe ser válido (si existe) y startDate no debe ser mayor que endDate
            const isEndDateValid = !endDate || (endDate && checkDate.isBefore(endDate));
    
            return !(isStartDateValid && isEndDateValid);
        }
    
        if (props.stage === 1) {
            // endDate debe ser válido y no menor que hoy (si existe)
            const isEndDateValid = !endDate || (endDate && (checkDate.isAfter(hoy) || checkDate.isSame(hoy, 'day')));
            // startDate debe ser válido y endDate no debe ser menor que startDate
            const isStartDateValid = startDate && (!endDate || checkDate.isAfter(startDate));
    
            return !(isEndDateValid && isStartDateValid);
        }
    
        return false; // Por defecto, habilitar el botón si no está en ninguna etapa
    }    
    
    const returnTitle = () => {
        if( props.stage === 0 ) {
            return `${ props.origin.nombre } - ${ props.destination.nombre }`;
        } else if( props.stage === 1 ) {
            return `${ props.destination.nombre } - ${ props.origin.nombre }`;
        } else {
            return 'Viaja en Pullman Bus'
        }
    }

    const searchDate = (date:Date) => {
        debugger;
        const data = {
            origen: props.origin,
            destino: props.destination,
            startDate: props.stage === 0 ? dayjs(date).format("YYYY-MM-DD") : props.startDate,
            endDate: props.stage === 1 ? dayjs(date).format("YYYY-MM-DD") : props.endDate,
            mascota_allowed: false
        }

        const encriptedData = encryptDataNoSave(data, 'search');

        router.replace(`/comprar?search=${ encriptedData }`).then(() => window.location.reload()).catch(err => console.error(err));
    }

    return (
        <>
            <header className='container shadow-sm d-block d-md-none sticky-top bg-white rounded-bottom-4 py-2 text-center'>
                <div className='row text-center justify-content-evenly'>
                    <div className='col-2'>
                        <img src="img\icon\buttons\chevron-back-circle-outline.svg" width={24} height={24} onClick={ () => router.push('') }/>
                    </div>
                    <div className='col-8 d-flex justify-content-center align-content-center'>
                        <img src="img\icon\general\location-outline.svg" width={24} height={24}/>
                        <span className='text-secondary fs-6 fw-bold'>{ returnTitle() }</span>
                    </div>
                    <div className='col-2'>
                        <button type="button" className="btn p-0" data-bs-toggle="modal" data-bs-target="#exampleModal">
                            <img src="img\icon\buttons\pencil.svg" width={24} height={24}/>
                        </button>
                    </div>
                </div>
                {
                    prevDate && activeDate && nextDate && (
                        <div className='row text-center mt-3 justify-content-evenly'>
                            <div className="col-4 p-0">
                                <button 
                                    type="button" 
                                    className='btn btn-outline-secondary btn-sm rounded-3 px-2' 
                                    disabled={ checkDate(prevDate) } 
                                    onClick={ () => searchDate(prevDate) }>
                                    { prevDate && format(prevDate, "ddd, D MMM") }
                                </button>
                            </div>
                            <div className="col-4 p-0">
                                <button type="button" className='btn btn-outline-primary btn-sm rounded-3 px-2'>
                                    { format(activeDate, "ddd, D MMM") }
                                </button>
                            </div>
                            <div className="col-4 p-0">
                                <button 
                                    type="button" 
                                    className='btn btn-outline-secondary btn-sm rounded-3 px-2' 
                                    disabled={ checkDate(nextDate) }
                                    onClick={ () => searchDate(nextDate) }>
                                    { nextDate && format(nextDate, "ddd, D MMM") }
                                </button>
                            </div>
                        </div>
                    )
                }
            </header>
            <div className="modal fade" id="exampleModal" tabIndex={ -1 } aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-fullscreen-sm-down">
                    <div className="modal-content">
                        <div className="modal-header border border-0">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="d-flex m-auto">
                            <BusquedaServicio />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
