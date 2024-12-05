import React, { useEffect, useState } from 'react'

import { encryptDataNoSave } from "utils/encrypt-data";

import { format } from "@formkit/tempo";
import dayjs from "dayjs";
import { useRouter } from 'next/router';
import BusquedaServicio from 'components/BusquedaServicio/BusquedaServicio';
import { useDispatch, useSelector } from 'react-redux';

import { limpiarListaCarritoCambioFecha } from 'store/usuario/compra-slice';

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
    setStage: Function;
    componentSearch: Function;
}

export default function MobileSearchBar(props:MobileSearchBarProps) {

    const [activeDate, setActiveDate] = useState(props.startDate || new Date());
    const [prevDate, setPrevDate] = useState<Date | null>(null);
    const [nextDate, setNextDate] = useState<Date | null>(null);
    const [timeToEnd, setTimeToEnd] = useState<string>('');

    const router = useRouter();

    const live_time = useSelector((state: any) => state.compra?.live_time) || 0;

    const dispatch = useDispatch();

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
        if( props.endDate && props.stage === 1 ) {
            setActiveDate(props.endDate);
        } else if( props.startDate && props.stage === 0 ) {
            setActiveDate(props.startDate);
        }
    }, [props.stage, props.startDate, props.endDate])

    useEffect(() => {
        updateDates();
    }, [activeDate]);

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
            return `${ props.origin.nombre } - ${ props.destination.nombre }`;
        }
    }

    const handleSearchDate = async (date: Date) => {
        await props.componentSearch(
            props.stage === 0 ? date : props.startDate,
            props.stage === 1 ? date : props.endDate
        );

        try {
            dispatch(limpiarListaCarritoCambioFecha({ stage: props.stage }));
        } catch (error) {}

        setActiveDate(date);
    };

    const timer = () => {
        const now = new Date().getTime();
        const distance = live_time - now;

        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if( distance >= 0 ) {
            setTimeToEnd(
              `${minutes < 10 ? "0" : ""}${minutes}:${
                seconds < 10 ? "0" : ""
              }${seconds}`
            );
        }
    }

    const includeStage = () => {
        if( props.endDate ) {
            return props.stage === 0 || props.stage === 1;
        } else {
            return props.stage === 0;
        }
    };

    useEffect(() => {
        if( !includeStage() ) {
            setInterval(() => timer(), 1000);
        }
    }, [props.stage])

    const handleBackButton = () => {
        if( props.stage === 0 ) {
            router.push('');
        } else {
            props.setStage(props.stage - 1);
        }
    }

    return (
        <>
            <header className='container-fluid shadow-sm d-block d-md-none sticky-top bg-white rounded-bottom-4 py-2 text-center'>
                <div className='row text-center justify-content-evenly'>
                    <div className='col-2'>
                        <img src="img\icon\buttons\chevron-back-circle-outline.svg" width={24} height={24} onClick={ handleBackButton }/>
                    </div>
                    <div className={`${ includeStage() ? 'col-8' : 'col-7' } d-flex justify-content-center align-content-center`}>
                        {
                            includeStage() ? (
                                <>
                                    <img src="img\icon\general\location-outline.svg" width={24} height={24}/>
                                    <span className='text-secondary fs-6 fw-bold'>{ returnTitle() }</span>
                                </>
                            ) : (
                                <img src="img\icon\logos\Logo.svg" className='img-fluid' alt='Logo Pullman Bus'/>
                            )
                        }
                    </div>
                    <div className={`${ includeStage() ? 'col-2' : 'col-3'}`}>
                        {
                            includeStage() ? (
                                <button type="button" className="btn p-0" data-bs-toggle="modal" data-bs-target="#busquedaServicioModal">
                                    <img src="img\icon\buttons\pencil.svg" width={24} height={24}/>
                                </button>
                            ) : (
                                <span className="badge text-bg-secondary bg-opacity-50 d-flex align-items-center gap-1 text-center justify-content-center">
                                    { timeToEnd }
                                </span>
                            )
                        }
                    </div>
                    {
                        !includeStage() && (
                            <div className='col-12 d-flex justify-content-center align-content-center pt-3 pb-2'>
                                <img src="img\icon\general\location-outline.svg" width={24} height={24}/>
                                <span className='text-secondary fs-6 fw-bold'>{ returnTitle() }</span>
                            </div>
                        )
                    }
                </div>
                {
                    includeStage() && prevDate && activeDate && nextDate && (
                        <div className='row text-center mt-3 justify-content-evenly'>
                            <div className="col-4 p-0">
                                <button 
                                    type="button" 
                                    className='btn btn-outline-secondary btn-sm rounded-3 px-2' 
                                    disabled={ checkDate(prevDate) } 
                                    onClick={ () => handleSearchDate(prevDate) }>
                                    { prevDate && format(prevDate, "ddd, D MMM", "es") }
                                </button>
                            </div>
                            <div className="col-4 p-0">
                                <button type="button" className='btn btn-outline-primary btn-sm rounded-3 px-2'>
                                    { format(activeDate, "ddd, D MMM", "es") }
                                </button>
                            </div>
                            <div className="col-4 p-0">
                                <button 
                                    type="button" 
                                    className='btn btn-outline-secondary btn-sm rounded-3 px-2' 
                                    disabled={ checkDate(nextDate) }
                                    onClick={ () => handleSearchDate(nextDate) }>
                                    { nextDate && format(nextDate, "ddd, D MMM", "es") }
                                </button>
                            </div>
                        </div>
                    )
                }
            </header>
            <div className="modal fade" id="busquedaServicioModal" tabIndex={ -1 } aria-labelledby="busquedaServicioModalLabel" aria-hidden="true">
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
