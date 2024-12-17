import React from 'react'
import ServiceSeat from '@components/sale/ServiceSeat';

type ServiceSitsMapProps = {

}


export default function ServiceSeatsMap(props: ServiceSitsMapProps) {
    const seatsMapExample = [
        {
            type: 'sinasiento',
            sitNumber: '',
            value: 0
        },
        {
            type: 'pasillo',
            sitNumber: '',
            value: 0
        },
        {
            type: 'libre',
            sitNumber: '',
            value: 0
        },
        {
            type: 'ocupado',
            sitNumber: '',
            value: 0
        },
        {
            type: 'seleccionado',
            sitNumber: '',
            value: 0
        },
        {
            type: 'pet-free',
            sitNumber: '',
            value: 0
        },
        {
            type: 'pet-busy',
            sitNumber: '',
            value: 0
        },
        {
            type: 'pet-selected',
            sitNumber: '',
            value: 0
        }
    ];
  return (
    <div className="bg-danger container border rounded">
        {/* Habilitado para mobile */}
        <div className="d-md-none row flex-column bg-light p-3 gap-1">
            { seatsMapExample.map(seat => (
                <ServiceSeat 
                    type={ seat.type }
                    seatNumber='10'
                />
            ))}
        </div>

        {/* Habilitado para desktop */}
        <div className="d-none d-md-flex row justify-content-center bg-light p-3">

        </div>
    </div>
  )
}
