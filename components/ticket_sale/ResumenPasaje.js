const ResumenPasaje = (props) => {

    const { tipoPasaje, pasaje } = props;

    return (
        <div className="bloque" style={{ backgroundColor: "#F6F8FB" }}>
            <div className="top-asiento">
                <div className="row">
                    <div className="col-12 col-md-6">
                        <div className="row">
                            <div className="col-2">
                                <strong>{ tipoPasaje }</strong>
                            </div>
                            <div className="col-1">
                                <img src="img/icon-ida-viaje.svg" alt=""/>
                            </div>
                            <div className="col-9">
                                <div className="w-100 mb-3">
                                    <span>
                                        <strong className="d-inline">
                                            { pasaje.terminalSalida }
                                        </strong>
                                    </span>
                                    <br />
                                    <span>
                                        { `${ pasaje.fechaSalida } - ${ pasaje.horaSalida }` }
                                    </span>
                                </div>
                                <div className="w-100">
                                    <span>
                                        <strong className="d-inline">
                                            { pasaje.terminaLlegada }
                                        </strong>
                                    </span>
                                    <br />
                                    <span>
                                        { `${ pasaje.fechaLlegada } - ${ pasaje.horaLlegada }` }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResumenPasaje;