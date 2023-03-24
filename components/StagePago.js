import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import Rut from 'rutjs';

import { PasajeConvenioDTO } from 'pages/dto/PasajesDTO';
import { GuardarCarroDTO, PasajePagoDTO } from '../pages/dto/PasajesDTO';
import ResumenPasaje from './ResumenPasaje';
import InformacionPasajero from './InformacionPasajero';
import InformacionComprador from './InformacionComprador';

const isSame = (array1, array2) => array1.length === array2.length && array1.every((value, index) => value === array2[index]);

const StagePago = (props) => {

    const { carro, nacionalidades, convenios, mediosDePago, setCarro } = props;

    const [convenioSelected, setConvenioSelected] = useState(null);
    const [convenio, setConvenio] = useState(null);
    const [convenioActive, setConvenioActive] = useState(null);
    const [convenioFields, setConvenioFields] = useState({});
    const [payment, setPayment] = useState({});

    const payment_form = useRef(null);

    async function getConvenio() {
        try {
            const convenio_response = await axios.post('/api/convenio', {
                idConvenio: convenioSelected,
            });
            setConvenio(convenio_response.data);
            setConvenioFields({});
        } catch ({ message }) {
            console.error(`Error al obtener convenio [${ message }]`);
        }
    };

    function validarFormatoRut(name, value) {
        try {
            if ( name.trim() == 'rut' && value.length > 2 ) {
                let rut = new Rut(value);
                value = new Rut(rut.getCleanRut().replace('-', '')).getNiceRut(true);
            }
            return value;
        } catch ({ message }) {
            console.error(`Error al validar formato de rut [${ message }]`);
        }
    }

    async function validarConvenio() {
        try {
            const pasajes = [
                ...carro.clientes_ida.map((pasajeIda) => new PasajeConvenioDTO(pasajeIda)),
                ...carro.clientes_vuelta.map((pasajeVuelta) => new PasajeConvenioDTO(pasajeVuelta))
            ]
    
            const { data } = await axios.post('/api/validar-convenio', {
                convenio: convenioSelected,
                fields: convenioFields,
                pasajes: pasajes,
            });
    
            if ( data.mensaje == 'OK' && Number(data.descuento) > 0 ) {
                setConvenioActive(data);
            }   
        } catch ({ message }) {
            console.error(`Error al validar convenio [${ message }]`)
        }
    };

    function convenioField({ name, value }) {
        try {
            let convenioFieldsTemp = { ...convenioFields };
            convenioFieldsTemp[name] = value;
            setConvenioFields(convenioFieldsTemp);
        } catch ({ message }) {
            console.error(`Error al asignar convenio [${ message }]`);
        }
    };

    function obtenerPagoConvenioActivo(origen, asiento, piso) {
        try {
            return Number(convenioActive.listaBoleto.find((boleto) => 
                boleto.origen == origen && 
                boleto.asiento == asiento && 
                boleto.piso == piso
            ));
        } catch ({ message }) {
            console.error(`Error al obtener pago convenio [${ message }]`);
        }
    }

    function getSubtotal(clientes, clean) {
        try {
            return clientes.reduce((valorAcumulado, { tarifa, origen, asiento, piso }) => {
                const precio = !clean && convenioActive ? 
                    obtenerPagoConvenioActivo(origen, asiento, piso) :
                    Number(tarifa.replace(/[^\d.-]/g, ''));
                valorAcumulado = Number(valorAcumulado) + precio;
                return valorAcumulado;
            }, 0);
        } catch ({ message }) {
            console.error(`Error al obtener el sub total [${ message }]`);
        }
    };

    function getTotal() {
        try {
            const ida = getSubtotal(carro.clientes_ida);
            const vuelta = getSubtotal(carro.clientes_vuelta);
            return Number(ida) + Number(vuelta);
        } catch ({ message }) {
            console.error(`Error al obtener el total [${ message }]`);
        }
    };

    function isValidPasajero(pasajero, indexPasajero, direccionRecorrido) {
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

    function isPaymentValid() {
        try {
            let isValid = true;
    
            const pasajerosIda = carro.clientes_ida.reduce((valorIncial, pasajeroRecorrido, indexPasajero) => {
                if ( !isValidPasajero(pasajeroRecorrido.pasajero, indexPasajero, 'ida') ) {
                    valorIncial = false;
                }
                return valorIncial;
            }, true);
    
            const pasajerosVuelta = carro.clientes_vuelta.reduce((valorIncial, pasajeroRecorrido, indexPasajero) => {
                if ( !isValidPasajero(pasajeroRecorrido.pasajero, indexPasajero, 'vuelta') ) {
                    valorIncial = false;
                }
                return valorIncial;
            }, true);
    
            if ( !pasajerosIda || !pasajerosVuelta ) {
                isValid = false;
            }
    
            return isValid;    
        } catch ({ message }) {
            console.error(`Error al validar el pago [${ message }]`);
        }
    };

    async function sendToPayment() {
        try {
            if ( !isPaymentValid() )  return;
            let pasajes = [
                ...carro.clientes_ida.map((clientesIdaMapped, clientesIdaIndex) => {
                    const pasajero = clientesIdaMapped.pet ? carro.clientes_ida[clientesIdaIndex - 1] : clientesIdaMapped.pasajero;
                    const convenioActivo = convenioActive ? convenioActive.idConvenio : '';
                    const datoConvenio = convenioActive ? convenioActive.listaAtributo[0].valor : '';
                    const precioConvenio = convenioActive ? 
                    Number(convenioActive.listaBoleto.find((boleto) => 
                        boleto.origen == clientesIdaMapped.origen && 
                        boleto.asiento == clientesIdaMapped.asiento && 
                        boleto.piso == clientesIdaMapped.piso).pago) : clientesIdaMapped.tarifa.replace(',', '');
                    return new PasajePagoDTO(clientesIdaMapped, pasajero, clientesIdaMapped.extras, convenioActivo, precioConvenio, datoConvenio);
                }),
                ...carro.clientes_vuelta.map((clientesVueltaMapped, clientesVueltaIndex) => {
                    const pasajero = clientesVueltaMapped.pet ? carro.clientes_ida[clientesVueltaIndex - 1] : clientesVueltaMapped.pasajero;
                    const convenioActivo = convenioActive ? convenioActive.idConvenio : '';
                    const datoConvenio = convenioActive ? convenioActive.listaAtributo[0].valor : '';
                    const precioConvenio = convenioActive ? 
                    Number(convenioActive.listaBoleto.find((boleto) => 
                        boleto.origen == clientesVueltaMapped.origen && 
                        boleto.asiento == clientesVueltaMapped.asiento && 
                        boleto.piso == clientesVueltaMapped.piso).pago) : clientesVueltaMapped.tarifa.replace(',', '');
                    return new PasajePagoDTO(clientesVueltaMapped, pasajero, clientesVueltaMapped.extras, convenioActivo, precioConvenio, datoConvenio);
                }),
            ];

            const { email, rut } = carro.datos;

            const response = await axios.post('/api/guardar-carro', new GuardarCarroDTO(email, rut, getTotal(), pasajes));

            if ( !response.data.error ) {
                setPayment({
                    ...payment,
                    url: response.data.url,
                    token: response.data.token,
                });
            }
        } catch ({ message }) {
            console.error(`Error al enviar pago [${ message }]`);   
        }
    };

    useEffect(() => {
        (async () => await getConvenio())();
    }, [convenioSelected]);

    useEffect(() => {
        if( payment.url ) {
            payment_form.current?.submit();
        }
    }, [payment]);

    return (
        <div className='pago'>
            <div className='container'>
                <div className='bloque bg-white pasajeros'>
                    <h2>Registro de pasajeros</h2>
                    <ResumenPasaje tipoPasaje={ 'IDA' } pasaje={ carro.pasaje_ida }/>
                    {
                        carro.clientes_ida.map((clienteMapped, indexCliente) => {
                        return (
                            <InformacionPasajero 
                                key={ `key-informacion-pasajero-ida-${ indexCliente }` }
                                tipoViaje={ 'ida' } 
                                cliente={ clienteMapped } 
                                index={ indexCliente } 
                                nacionalidades={ nacionalidades }
                                carro={ carro }
                                setCarro={ setCarro }
                                validarFormatoRut={ validarFormatoRut }/>
                        );
                    })}
                    { 
                        carro.pasaje_vuelta ? (
                            <>
                                <ResumenPasaje tipoPasaje={ 'VUELTA' } pasaje={ carro.pasaje_vuelta }/>
                                {
                                    carro.clientes_vuelta.map((clienteMapped, indexCliente) => {
                                        return (
                                            <InformacionPasajero 
                                                key={ `key-informacion-pasajero-vuelta-${ indexCliente }` }
                                                tipoViaje={ 'ida' } 
                                                cliente={ clienteMapped } 
                                                index={ indexCliente } 
                                                nacionalidades={ nacionalidades }
                                                carro={ carro }
                                                setCarro={ setCarro }
                                                validarFormatoRut={ validarFormatoRut }/>
                                        );
                                    }
                                )}
                            </>
                        ) : ('')
                    }
                </div>

                <InformacionComprador setCarro={ setCarro } carro={ carro } validarFormatoRut={ validarFormatoRut }/>

                <div className='d-flex'>
                    <div className='col-12 col-md-12 m-1'>
                        <div className='bloque  bg-white'>
                            <h2>Convenios</h2>
                            <div className='grupo-campos mt-5'>
                                <label className='label-input input-op'>
                                    Convenios
                                </label>
                                <select
                                    name='convenios'
                                    id='cars'
                                    className='form-control seleccion'
                                    value={ convenioSelected }
                                    onChange={ (e) => setConvenioSelected(e.target.value) }>
                                    <option value=''>
                                        Seleccione Convenio
                                    </option>
                                    { 
                                        convenios.map((convenioMapped) => (
                                            <option value={ convenioMapped.idConvenio }>
                                                { convenioMapped.descripcion }
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            { 
                                convenio ? (
                                    <>
                                        { 
                                            convenio.map((formularioConvenio) => (
                                                <div className='grupo-campos mt-5'>
                                                    <label>
                                                        {formularioConvenio.tipo}
                                                    </label>
                                                    <input
                                                        onChange={ (e) => convenioField(e.target) }
                                                        value={ convenioFields[formularioConvenio.tipo] }
                                                        type={ formularioConvenio.tipoInput }
                                                        name={ formularioConvenio.tipo }
                                                        className='form-control' />
                                                </div>
                                            ))
                                        }
                                        <a className='btn' href='#' onClick={ (e) => { e.preventDefault(); validarConvenio(); }}>
                                            Validar Convenio
                                        </a>
                                    </>
                                ) : ('')
                            }
                        </div>
                    </div>
                </div>
                <div className='bloque comprador  bg-white'>
                    <h2>Resumen de compra</h2>
                    <div className='row'>
                        <div className='col-12 col-md-7'>
                            { carro.clientes_ida ? (
                                <div className='row cantidad-asiento mb-5'>
                                    <div className='col-8'>
                                        <div className='row'>
                                            <div className='col-12'>
                                                <strong>IDA</strong>
                                            </div>
                                        </div>
                                        <div className='row'>
                                            <div className='col-8'>
                                                <h5>Cantidad de asientos</h5>
                                            </div>
                                            <div className='col-4'></div>
                                        </div>
                                        {
                                            function () {
                                                let servicios = carro.clientes_ida.reduce((a, b) => {
                                                    if ( !a[b.servicio] ) {
                                                        a[b.servicio] = [];
                                                    }
                                                    a[b.servicio].push(b);
                                                    return a;
                                                }, {});

                                                return Object.keys(servicios).map((i) => (
                                                <>
                                                    <div className='row'>
                                                        <div className='col-8'>
                                                            <h4>
                                                                {
                                                                    servicios[
                                                                        i
                                                                    ]
                                                                        .length
                                                                }
                                                                X
                                                                boleto{' '}
                                                                {
                                                                    i
                                                                }
                                                            </h4>
                                                        </div>
                                                        <div className='col-4 d-flex justify-content-end'>
                                                            <h3>
                                                                $
                                                                {getSubtotal(
                                                                    servicios[
                                                                        i
                                                                    ]
                                                                ).toLocaleString(
                                                                    'es'
                                                                )}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <div className='row'>
                                                        <div className='col-8'>
                                                            <p>
                                                                Precio
                                                                Normal
                                                            </p>
                                                        </div>
                                                        <div className='col-4 d-flex justify-content-end'>
                                                            <h4 className='tachado'>
                                                                $
                                                                {(
                                                                    Math.round(
                                                                        (getSubtotal(
                                                                            servicios[
                                                                                i
                                                                            ],
                                                                            true
                                                                        ) *
                                                                            1.12) /
                                                                            100
                                                                    ) *
                                                                    100
                                                                ).toLocaleString(
                                                                    'es'
                                                                )}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                </>
                                            ));
                                        }.call(this)}
                                    </div>
                                </div>
                            ) : (
                                ''
                            )}

                            {carro.clientes_vuelta ? (
                                <div className='row cantidad-asiento mb-5'>
                                    <div className='col-8'>
                                        <div className='row'>
                                            <div className='col-12'>
                                                <strong>
                                                    VUELTA
                                                </strong>
                                            </div>
                                        </div>
                                        <div className='row'>
                                            <div className='col-8'>
                                                <h5>
                                                    Cantidad de
                                                    asientos
                                                </h5>
                                            </div>
                                            <div className='col-4'></div>
                                        </div>
                                        {function () {
                                            let servicios =
                                                carro.clientes_vuelta.reduce(
                                                    (a, b) => {
                                                        if (
                                                            !a[
                                                                b
                                                                    .servicio
                                                            ]
                                                        ) {
                                                            a[
                                                                b.servicio
                                                            ] =
                                                                [];
                                                        }
                                                        a[
                                                            b
                                                                .servicio
                                                        ].push(
                                                            b
                                                        );
                                                        return a;
                                                    },
                                                    {}
                                                );
                                            return Object.keys(
                                                servicios
                                            ).map((i) => (
                                                <>
                                                    <div className='row'>
                                                        <div className='col-8'>
                                                            <h4>
                                                                {
                                                                    servicios[
                                                                        i
                                                                    ]
                                                                        .length
                                                                }
                                                                X
                                                                boleto{' '}
                                                                {
                                                                    i
                                                                }
                                                            </h4>
                                                        </div>
                                                        <div className='col-4 d-flex justify-content-end'>
                                                            <h3>
                                                                $
                                                                {getSubtotal(
                                                                    servicios[
                                                                        i
                                                                    ]
                                                                ).toLocaleString(
                                                                    'es'
                                                                )}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    {
                                                        <div className='row'>
                                                            <div className='col-8'>
                                                                <p>
                                                                    Precio
                                                                    Normal
                                                                </p>
                                                            </div>
                                                            <div className='col-4 d-flex justify-content-end'>
                                                                <h4 className='tachado'>
                                                                    $
                                                                    {(
                                                                        Math.round(
                                                                            (getSubtotal(
                                                                                servicios[
                                                                                    i
                                                                                ],
                                                                                true
                                                                            ) *
                                                                                1.12) /
                                                                                100
                                                                        ) *
                                                                        100
                                                                    ).toLocaleString(
                                                                        'es'
                                                                    )}
                                                                </h4>
                                                            </div>
                                                        </div>
                                                    }
                                                </>
                                            ));
                                        }.call(this)}
                                    </div>
                                </div>
                            ) : (
                                ''
                            )}
                        </div>
                        <div className='col-12 col-md-5 total-pagar'>
                            <div className='row'>
                                <div className='col-6 d-flex align-items-center'>
                                    <h3>Total a pagar:</h3>
                                </div>
                                <div className='col-6 d-flex justify-content-end'>
                                    <h2>
                                        $
                                        {getTotal().toLocaleString(
                                            'es'
                                        )}
                                    </h2>
                                </div>
                            </div>
                            <div className='row my-5'>
                                <div className='col-12'>
                                    {mediosDePago.map(
                                        (i) => (
                                            <img
                                                src={
                                                    'data:image/png;base64,' +
                                                    i.imagen
                                                }
                                            />
                                        )
                                    )}
                                </div>
                                <div className='col-12 p-2'>
                                    <label className='d-flex align-items-baseline mb-3 mt-3'>
                                        <input
                                            type='checkbox'
                                            className='mr-2'
                                        />
                                        <small>
                                            He leido los{' '}
                                            <a
                                                href='/terminos'
                                                target='_blank'
                                            >
                                                Terminos y
                                                Condiciones
                                            </a>{' '}
                                            de la compra
                                        </small>
                                    </label>
                                    <label className='d-flex align-items-baseline'>
                                        <input
                                            type='checkbox'
                                            className='mr-2'
                                        />
                                        <small>
                                            Me gustaria recibir
                                            noticias,
                                            actualizaciones o
                                            información de
                                            Pullman Bus
                                        </small>
                                    </label>
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col-12'>
                                    <a
                                        href='#'
                                        className={
                                            'btn ' +
                                            (!isPaymentValid()
                                                ? 'disabled'
                                                : '')
                                        }
                                        disabled={
                                            !isPaymentValid()
                                        }
                                        onClick={(e) => {
                                            e.preventDefault();
                                            sendToPayment();
                                        }}
                                    >
                                        Pagar
                                    </a>

                                    <form
                                        ref={payment_form}
                                        style={{
                                            display: 'none',
                                        }}
                                        method='POST'
                                        action={payment.url}
                                    >
                                        <input
                                            name='TBK_TOKEN'
                                            value={
                                                payment.token
                                            }
                                        />
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StagePago;