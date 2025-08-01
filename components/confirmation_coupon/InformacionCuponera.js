import Rut from 'rutjs';

const InformacionComprador = (props) => {
    const { setCarro, carro, validarFormatoRut } = props;

    function setDataComprador({ name, value }) {
        try {
            let carro_temp = { ...carro };
            carro_temp.datos[name] = value;
            setCarro(carro_temp);
        } catch ({ message }) {
            console.error(`Error al agregar informacion del comprador [${ message }]`);
        }
    };

    return (
        <div className='bloque comprador  bg-white'>
            <h2>Datos cupón</h2>
            <div className='row justify-content-center mb-5'>
                <div className='col-9 col-md-9'>
                    <div className='grupo-campos'>
                        <label className='label-input'>
                            Código cupón
                        </label>
                        <input
                            type='text'
                            value={ carro.datos['codigoCuponera'] }
                            name='codigoCuponera'
                            placeholder='Ej: CUP00000001'
                            className='form-control'
                            onChange={ (e) => setDataComprador(e.target) } />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InformacionComprador;