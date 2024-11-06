import Image from 'next/image'
import React from 'react'

import ServiceSeatsMap from '@components/sale/ServiceSeatsMap';

type ServiceDetailProps = {

}

export default function ServiceDetail(props:ServiceDetailProps){
  return (
    <section className="container">
        <div className="row align-items-center">
            <div id="availability-items" className="container col-5 col-md-12 align-items-center text-center gap-3">
                <div className="row gap-4">
                    <ul className="col-12 list-group">
                        <li className="list-group-item d-flex gap-2 align-items-center border-0 py-1">
                            <Image src="img/ui/service-availability/radio-button-available-outline.svg" alt="Logo asiento disponible" width={ 16 } height={ 16 }/>
                            <span>Disponible</span>
                        </li>
                        <li className="list-group-item d-flex gap-2 align-items-center border-0 py-1">
                            <Image src="img/ui/service-availability/radio-button-selected-outline.svg" alt="Logo asiento seleccionado" width={ 16 } height={ 16 }/>
                            <span>Seleccionado</span>
                        </li>
                        <li className="list-group-item d-flex gap-2 align-items-center border-0 py-1">
                            <Image src="img/ui/service-availability/radio-button-unavailable-outline.svg" alt="Logo asiento no disponible" width={ 16 } height={ 16 }/>
                            <span>Reservado</span>
                        </li>
                    </ul>
                    <ul className="col-12 list-group">
                        <li className="list-group-item d-flex gap-2 align-items-center border-0 py-1">
                            <Image src="img/ui/service-availability/radio-button-mab-available-outline.svg" alt="Logo asiento mascota disponible" width={ 16 } height={ 16 }/>
                            <span>Disponible</span>
                        </li>
                        <li className="list-group-item d-flex gap-2 align-items-center border-0 py-1">
                            <Image src="img/ui/service-availability/radio-button-mab-selected-outline.svg" alt="Logo asiento mascota seleccionado" width={ 16 } height={ 16 }/>
                            <span>Seleccionado</span>
                        </li>
                        <li className="list-group-item d-flex gap-2 align-items-center border-0 py-1">
                            <Image src="img/ui/service-availability/radio-button-mab-unavailable-outline.svg" alt="Logo asiento mascota no disponible" width={ 16 } height={ 16 }/>
                            <span>Reservado</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className='col-7 col-md-12'>
                <ServiceSeatsMap />
            </div>
        </div>
    </section>
  )
}
