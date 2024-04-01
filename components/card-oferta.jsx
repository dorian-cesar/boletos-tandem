import React from "react";

const CardOferta = (props) => {

    const { 
        origen = 'Sin Especificar', 
        destino = 'Sin Especificar', 
        precioAnterior = '0', 
        precio = '0', 
        descuento = '', 
        tipoBus = 'Sin Especificar', 
        mascota = false, 
        vigencia = 'Sin Especificar' 
    } = props;

    return (
        <div className="d-flex w-100">
            <div className="card-ofertas mobile-view">
                <img className="card-img-top imagen" src="img/icon/images/antofagasta.jpeg"/>
                <div className="col-12 col-md-12 col-lg-11">
                    <div className="d-flex justify-content-end align-items-center">
                        <div className="card-ida-vuelta">Ida y vuelta</div>
                    </div>
                </div>
                <div className="card-body px-0">
                    <div className="px-4 mt-3">
                        <div className="d-flex flex-column">
                            <span className="title-tramo">Tramo:</span>
                            <span className="title-ciudades mt-2">
                                { origen } <br />
                                { destino}
                            </span>
                            <div className="title-vigencia mt-2">
                                <span>Vigencia:</span>
                                <span className="ms-2">{ vigencia }</span>
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col-12 col-md-9 col-lg-9">
                                <div className="d-flex justify-content-end align-items-center">
                                    <div className="col-2">
                                        <img
                                            className="imagen-mascota"
                                            src="img/bus-outline.svg"
                                        />
                                    </div>
                                    <div className="col-10">
                                        <span className="title-tipo-bus">
                                            { tipoBus }
                                        </span>
                                    </div>
                                </div>
                            </div>
                            { mascota && (
                                <div className="col-12 col-md-9 col-lg-9">
                                    <div className="d-flex justify-content-end align-items-center">
                                        <div className="col-2">
                                            <img
                                                className="imagen-mascota"
                                                src="img/icon/card/paw-outline-oferta.svg"
                                            />
                                        </div>
                                        <div className="col-10">
                                            <span className="title-tipo-bus">
                                                Mascota a bordo
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <ul className="list-group list-group-flush ms-4">
                        <li className="list-group-item"></li>
                        <div className="col-12 col-md-9 col-lg-12">
                            <div className="d-flex justify-content-end align-items-center">
                                <div className="oferta-descuento">{ descuento }</div>
                            </div>
                        </div>
                    </ul>
                    <div className="ms-4">
                        <h5 className="title-persona">Precio por persona</h5>
                        <div className="col-12 col-md-9 col-lg-9">
                            <div className="d-flex justify-content-start align-items-center">
                                <div className="col-7">
                                    <h5 className="title-valor">${ precio }</h5>
                                </div>
                                <div className="col">
                                    <h5 className="title-valor-tachado">${ precioAnterior }</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-footer border border-0">
                        <div className="boton">Me interesa</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardOferta;