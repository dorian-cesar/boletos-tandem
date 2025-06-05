import React, { useState } from 'react'
import styles from './FiltroServicios.module.css'

export const FiltroServicios = (props) => {
    const { tipos_servicio = [], filter_tipo = [], filter_horas = [], filter_mascota = [], stage, toggleTipo, toggleHoras, setMascota, mascota_allowed } = props;

    return (
        <div key={stage + "it"} className={ `shadow-sm d-flex flex-col bg-white px-3 py-3 pt-1 rounded-4 gap-2 ${ styles["custom-shadow"] }` }>
            {/* <div id="petFilter">
                <h3>Filtrar por:</h3>
                <div className="form-check form-switch d-flex align-content-center">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="swirchCheckPetAllowedFilter"
                        defaultChecked={mascota_allowed}
                        onClick={() => setMascota(!mascota_allowed)} />
                    <label className={`form-check-label ms-1 ${styles['custom-form-check-label']}`} htmlFor="swirchCheckPetAllowedFilter">Mascota a Bordo</label>
                </div>
            </div> */}
            <div id="serviceType" className='d-flex flex-col mt-2'>
                <span className='fw-bold'>Tipo de servicio</span>
                <div className='d-flex flex-col gap-1 mt-1'>
                    {
                        tipos_servicio.map((tipoServicioMapped, indexTipoServicio) => {
                            if (tipoServicioMapped !== undefined && tipoServicioMapped !== '') {
                                return (
                                    <div key={`tipo-servicio-${indexTipoServicio}`} className="custom-control custom-checkbox">
                                        <input
                                            key={`check-${tipoServicioMapped}-key`}
                                            type="checkbox"
                                            className={styles['checkbox-round']}
                                            id={"tipoCheck" + indexTipoServicio}
                                            onClick={() => toggleTipo(tipoServicioMapped)}
                                            defaultValue={tipoServicioMapped}
                                            defaultChecked={filter_tipo.includes(tipoServicioMapped)} />
                                        <label
                                            className="custom-control-label"
                                            htmlFor={"tipoCheck" + indexTipoServicio}>
                                            {tipoServicioMapped}
                                        </label>
                                    </div>
                                );
                            } else {
                                return null;
                            }
                        })
                    }
                </div>
            </div>
            <div id="serviceSchedule" className='d-flex flex-col mt-2'>
                <span className='fw-bold'>Horarios</span>
                <div className='d-flex flex-col gap-1 mt-1'>
                    <div className="custom-control custom-checkbox">
                        <input
                            id="horaCheck1"
                            type="checkbox"
                            className={styles['checkbox-round']}
                            defaultChecked={filter_horas.includes("00:00-05:59")}
                            onClick={() => toggleHoras("00:00-05:59")} />
                        <label
                            className="custom-control-label"
                            htmlFor={"horaCheck1"}>
                            &nbsp;00:00 AM a 5:59 AM
                        </label>
                    </div>
                    <div className="custom-control custom-checkbox">
                        <input
                            id="horaCheck2"
                            type="checkbox"
                            className={styles['checkbox-round']}
                            defaultChecked={filter_horas.includes("06:00-11:59")}
                            onClick={() => toggleHoras("06:00-11:59")} />
                        <label
                            className="custom-control-label"
                            htmlFor={"horaCheck2"}>
                            &nbsp;6:00 AM a 11:59 AM
                        </label>
                    </div>
                    <div className="custom-control custom-checkbox">
                        <input
                            id="horaCheck3"
                            type="checkbox"
                            className={styles['checkbox-round']}
                            defaultChecked={filter_horas.includes("12:00-20:00")}
                            onClick={() => toggleHoras("12:00-20:00")} />
                        <label
                            className="custom-control-label"
                            htmlFor="horaCheck3">
                            &nbsp;12:00 PM a 19:59 PM
                        </label>
                    </div>
                    <div className="custom-control custom-checkbox">
                        <input
                            id="horaCheck4"
                            type="checkbox"
                            className={styles['checkbox-round']}
                            defaultChecked={filter_horas.includes("20:00-23:59")}
                            onClick={() => toggleHoras("20:00-23:59")} />
                        <label
                            className="custom-control-label"
                            htmlFor="horaCheck4">
                            &nbsp;20:00 PM en adelante
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}