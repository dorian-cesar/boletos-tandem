import axios from "axios";
import dayjs from "dayjs";
import DatePicker, { registerLocale } from "react-datepicker";
import Link from "next/link";
import Input from "../components/Input";
import { useEffect, useState, forwardRef } from "react";
import es from "date-fns/locale/es";
import { useRouter } from "next/router";

const customStyles = {
  control: (provided) => ({
    ...provided,
    background: "var(--Azul-fondo, #E6ECF6)",
  }),
};

const Ofertas = (props) => {
  return (
    <div className="container">
      <div className="title-ofertas">Ofertas destacadas</div>
      <div className="sub-title-ofertas">
        Infórmate sobre nuestros servicios, convenios y otros.
      </div>
      <br />
      <div className="row">
      <div className="col-12 col-md-6 col-lg-4">
          <div className="card-ofertas mobile-view">
            <img className="imagen" />
            <div className="col-12 col-md-12 col-lg-11">
              <div className="d-flex justify-content-end align-items-center">
                <div className="card-ida-vuelta">Ida y vuelta</div>
              </div>
            </div>
            <div className="card-body">
              <h5 className="title-tramo">Tramo</h5>
              <h5 className="title-ciudades">
                Santiago <br />
                La Serena
              </h5>
              <h5 className="title-vigencia">
                Vigencia: Enero 2024/ Febrero 2024
              </h5>
              <div className="row">
                <div className="col-12 col-md-9 col-lg-9">
                  <div className="d-flex justify-content-end align-items-center">
                    <div className="col-4"></div>
                    <div className="col">
                      <span className="title-tipo-bus">Bús salon cama</span>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-9 col-lg-9">
                  <div className="d-flex justify-content-end align-items-center">
                    <div className="col-4">
                      <img
                        className="imagen-mascota"
                        src="img/icon/card/paw-outline-oferta.svg"
                      />
                    </div>
                    <div className="col">
                      <span className="title-tipo-bus">Mascota a bordo</span>
                    </div>
                  </div>
                </div>
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item"></li>
                <div className="col-12 col-md-9 col-lg-12">
                  <div className="d-flex justify-content-end align-items-center">
                    <div className="oferta-descuento">20 %</div>
                  </div>
                </div>
              </ul>
              <h5 className="title-persona">Precio por persona</h5>
              <div className="col-12 col-md-9 col-lg-9">
                <div className="d-flex justify-content-end align-items-center">
                  <div className="col-8">
                    <h5 className="title-valor">$24.550</h5>
                  </div>
                  <div className="col">
                    <h5 className="title-valor-tachado">$33.800</h5>
                  </div>
                </div>
              </div>
              <div className="boton">Me interesa</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card-ofertas mobile-view">
            <img className="imagen" />
            <div className="col-12 col-md-12 col-lg-11">
              <div className="d-flex justify-content-end align-items-center">
                <div className="card-ida-vuelta">Ida y vuelta</div>
              </div>
            </div>
            <div className="card-body">
              <h5 className="title-tramo">Tramo</h5>
              <h5 className="title-ciudades">
                Santiago <br />
                La Serena
              </h5>
              <h5 className="title-vigencia">
                Vigencia: Enero 2024/ Febrero 2024
              </h5>
              <div className="row">
                <div className="col-12 col-md-9 col-lg-9">
                  <div className="d-flex justify-content-end align-items-center">
                    <div className="col-4"></div>
                    <div className="col">
                      <span className="title-tipo-bus">Bús salon cama</span>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-9 col-lg-9">
                  <div className="d-flex justify-content-end align-items-center">
                    <div className="col-4">
                      <img
                        className="imagen-mascota"
                        src="img/icon/card/paw-outline-oferta.svg"
                      />
                    </div>
                    <div className="col">
                      <span className="title-tipo-bus">Mascota a bordo</span>
                    </div>
                  </div>
                </div>
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item"></li>
                <div className="col-12 col-md-9 col-lg-12">
                  <div className="d-flex justify-content-end align-items-center">
                    <div className="oferta-descuento">20 %</div>
                  </div>
                </div>
              </ul>
              <h5 className="title-persona">Precio por persona</h5>
              <div className="col-12 col-md-9 col-lg-9">
                <div className="d-flex justify-content-end align-items-center">
                  <div className="col-8">
                    <h5 className="title-valor">$24.550</h5>
                  </div>
                  <div className="col">
                    <h5 className="title-valor-tachado">$33.800</h5>
                  </div>
                </div>
              </div>
              <div className="boton">Me interesa</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card-ofertas mobile-view">
            <img className="imagen" />
            <div className="col-12 col-md-12 col-lg-11">
              <div className="d-flex justify-content-end align-items-center">
                <div className="card-ida-vuelta">Ida y vuelta</div>
              </div>
            </div>
            <div className="card-body">
              <h5 className="title-tramo">Tramo</h5>
              <h5 className="title-ciudades">
                Santiago <br />
                La Serena
              </h5>
              <h5 className="title-vigencia">
                Vigencia: Enero 2024/ Febrero 2024
              </h5>
              <div className="row">
                <div className="col-12 col-md-9 col-lg-9">
                  <div className="d-flex justify-content-end align-items-center">
                    <div className="col-4"></div>
                    <div className="col">
                      <span className="title-tipo-bus">Bús salon cama</span>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-9 col-lg-9">
                  <div className="d-flex justify-content-end align-items-center">
                    <div className="col-4">
                      <img
                        className="imagen-mascota"
                        src="img/icon/card/paw-outline-oferta.svg"
                      />
                    </div>
                    <div className="col">
                      <span className="title-tipo-bus">Mascota a bordo</span>
                    </div>
                  </div>
                </div>
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item"></li>
                <div className="col-12 col-md-9 col-lg-12">
                  <div className="d-flex justify-content-end align-items-center">
                    <div className="oferta-descuento">20 %</div>
                  </div>
                </div>
              </ul>
              <h5 className="title-persona">Precio por persona</h5>
              <div className="col-12 col-md-9 col-lg-9">
                <div className="d-flex justify-content-end align-items-center">
                  <div className="col-8">
                    <h5 className="title-valor">$24.550</h5>
                  </div>
                  <div className="col">
                    <h5 className="title-valor-tachado">$33.800</h5>
                  </div>
                </div>
              </div>
              <div className="boton">Me interesa</div>
            </div>
          </div>
        </div>
      </div>
      <br />
    </div>
  );
};

export default Ofertas;
