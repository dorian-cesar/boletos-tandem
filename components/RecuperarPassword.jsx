const RecuperarPassword = ({onChangeMode}) => {

    const changeMode = () => {
        onChangeMode("0");
    }

  return (
    <>
      <div className="modal-content">
        <div className="modal-body">
          <div className="container">
            <div className="d-flex justify-content-center">
              <img src="img/icon-foto.svg" width={75}></img>
            </div>
            <div className="d-flex justify-content-center mt-2">
              <h4 className="titulo-azul">Recuperación de Contraseña</h4>
            </div>
            <div className="d-flex justify-content-center text-center">
              Ingresa un correo electrónico para enviarte un email con una contraseña provisoria
            </div>
            <div className="row mt-4">
              <div className="col-12">
                <label className="label-input">Correo electrónico</label>
                <input
                  type="text"
                  placeholder="Ej: example@example.com"
                  className="form-control"
                  name="email"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-modal-primary">
            Enviar
          </button>
          <button type="button" className="btn btn-modal-secondary" onClick={changeMode}>Volver</button>
        </div>
      </div>
    </>
  );
};

export default RecuperarPassword;
