import Rut from 'rutjs';

const isSame = (array1, array2) => array1.length === array2.length && array1.every((value, index) => value === array2[index]);

export function isValidPasajero(pasajero, indexPasajero, direccionRecorrido, setCarro, carro) {
    try {
        let isValid = true;
        let errors = [...pasajero.errors];
        let carroTemporal = { ...carro };
        let errorTemporal = [];

        if ( !pasajero.nombre || pasajero.nombre == '' ) {
            isValid = false;
        }

        if ( !pasajero.apellido || pasajero.apellido == '' ) {
            isValid = false;
        }

        if ( !pasajero.email || pasajero.email == '' ) {
            isValid = false;
        } else {
            if ( !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(pasajero.email) ) {
                errorTemporal.push('email');
            }
        }

        if ( !pasajero.email_2 || pasajero.email_2 == '' ) {
            isValid = false;
        } else {
            if ( pasajero.email != pasajero.email_2 ) {
                errorTemporal.push('email_2');
            }
        }

        if (!pasajero.rut || pasajero.rut == '') {
            isValid = false;
        } else {
            const rutValidacion = new Rut(pasajero.rut);
            if ( !rutValidacion.isValid ) {
                isValid = false;
                errorTemporal.push('rut');
            }
        }

        if (!isSame(errorTemporal, errors)) {
            carroTemporal[`clientes_${direccionRecorrido}`][indexPasajero].pasajero.errors = errorTemporal;
            setCarro(carroTemporal);
        }

        return isValid;
    } catch ({ message }) {
        console.error(`Error al validar pasajero [${ message }]`);
    }
};