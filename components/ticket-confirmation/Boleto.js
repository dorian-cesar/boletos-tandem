import dayjs from "dayjs";
import { useEffect, useState } from "react";

var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
const Boleto = (props) => {
  const getSubtotal = (clientes) => {
    return clientes.reduce((a, b) => {
      b.tarifa = b.tarifa.replace(".", ",");
      a = parseFloat(a) + Number(b.tarifa.replace(/[^\d.-]/g, ""));
      return a;
    }, 0);
  };
  let duracion = dayjs(
    props.fechaLlegada + " " + props.horaLlegada,
    "DD/MM/YYYY HH:mm"
  ).diff(
    dayjs(props.fechaSalida + " " + props.horaSalida, "DD/MM/YYYY HH:mm"),
    "minute"
  );

  duracion = Math.floor(duracion / 60) + " hrs " + (duracion % 60) + " min";
  const [piso, setPiso] = useState(1);
  const asientoClass = (asiento) => {
    const isSelected = props.asientos_selected.find(
      (i) => i.asiento === asiento.asiento && asiento.tipo !== "pet-busy"
    );
    const isPetSelected = props.asientos_selected.find(
      (i) => i.asiento === asiento.asiento && asiento.estado === "pet-busy"
    );

    let classes = "";
    if (isSelected) {
      classes += "seleccion ";
    }
    if (isPetSelected) {
      classes += "m-seleccion ";
    }
    if (asiento.tipo === "pet" && asiento.estado === "ocupado") {
      classes += "m-disponible ";
    }
    if (asiento.tipo === "pet" && asiento.estado === "pet-free") {
      classes += "m-disponible ";
    }
    if (
      asiento.estado === "pet-busy" &&
      !props.asientos_selected.find((i) => i.asiento === asiento.asiento)
    ) {
      classes += "m-reservado ";
    }
    if (asiento.estado === "ocupado") {
      classes += "reservado ";
    }
    if (asiento.estado === "libre") {
      classes += "disponible ";
    }
    if (asiento.asiento === "B1" || asiento.asiento === "B2") {
      classes += "bano ";
    }

    return classes.trim(); // Eliminar espacios en blanco adicionales al final
  };

  let currentSeatIndex;

  return (
    <div className="boleto">
      <input type="checkbox" checked={props.openPane == props.id} readOnly />

      <div className="block">
        <div className="content-block">
          <div className="row" onClick={() => props.setOpenPane(props.k)}>
            <div className="col-12 col-md-6 mb-4 mb-md-0">
              <div className="row">
                {props.mascota == "1" ? (
                  <img className="patita-over" src="/img/icon-patita.svg" />
                ) : (
                  ""
                )}
                <div className="col-4">
                  <div className="hora">{props.horaSalida}</div>
                  <strong>{props.terminalSalida}</strong>
                  <div className="fecha">{props.fechaSalida}</div>
                </div>
                <div className="col-4 text-center">
                  <span>Duración</span>
                  <span className="datos">
                    <strong>{duracion}</strong>
                  </span>
                </div>
                <div className="col-4 text-end">
                  <div className="hora">{props.horaLlegada}</div>
                  <strong>{props.terminalDestino}</strong>
                  <div className="fecha">{props.fechaLlegada}</div>
                </div>
                <div className="col-12">
                  <div className="barra">
                    <img src="img/icon-barra.svg" />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="row puntitos">
                <div className="col-12 col-md-7">
                  <div className="row mb-4">
                    <div className="col-6">
                      <span>Piso 1:</span>
                      <strong>{props.servicioPrimerPiso}</strong>
                    </div>
                    <div className="col-6 text-center d-flex align-items-center">
                      <strong className="precio">
                        ${props.tarifaPrimerPisoInternet}
                      </strong>
                    </div>
                  </div>
                  {props.busPiso2 ? (
                    <div className="row">
                      <div className="col-6">
                        <span>Piso 2:</span>
                        <strong>{props.servicioSegundoPiso}</strong>
                      </div>
                      <div className="col-6 text-center d-flex align-items-center">
                        <strong className="precio">
                          ${props.tarifaSegundoPisoInternet}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
                <div className="col-12 col-md-5  d-flex justify-content-center align-center">
                  <div className="px-3 px-md-0 mt-3 mt-md-0 w-100">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (Array.isArray(props.asientos_selected)) {
                          props.setPasaje(props);
                        }
                      }}
                      className={`btn ${
                        Array.isArray(props.asientos_selected) &&
                        props.asientos_selected.length === 0
                          ? "disabled"
                          : ""
                      }`}
                    >
                      Comprar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="block-2 pt-1 ">
            {props.loadingAsientos ? (
              <h5>Cargando</h5>
            ) : (
              <div className="seleccion-asiento mt-3">
                <ul
                  className="nav nav-pills mb-5"
                  id="pills-tab"
                  role="tablist"
                >
                  <li className="nav-item" role="presentation">
                    <button
                      className={"nav-link " + (piso == 1 ? "active" : "")}
                      id="pills-home-tab"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPiso(1);
                      }}
                      data-bs-toggle="pill"
                      data-bs-target="#pills-home"
                      type="button"
                      role="tab"
                      aria-controls="pills-home"
                      aria-selected="true"
                    >
                      <div className="row">
                        <div className="col-6 d-flex justify-content-start">
                          <strong>Piso 1</strong>
                        </div>
                        <div className="col-6 d-flex justify-content-end">
                          Valor: ${props.tarifaPrimerPisoInternet}
                        </div>
                      </div>
                    </button>
                  </li>
                  {props.busPiso2 ? (
                    <li className="nav-item" role="presentation">
                      <button
                        className={"nav-link " + (piso == 2 ? "active" : "")}
                        id="pills-profile-tab"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPiso(2);
                        }}
                        data-bs-toggle="pill"
                        data-bs-target="#pills-profile"
                        type="button"
                        role="tab"
                        aria-controls="pills-profile"
                        aria-selected="false"
                      >
                        <div className="row">
                          <div className="col-6 d-flex justify-content-start">
                            <strong>Piso 2</strong>
                          </div>
                          <div className="col-6 d-flex justify-content-end">
                            Valor: ${props.tarifaSegundoPisoInternet}
                          </div>
                        </div>
                      </button>
                    </li>
                  ) : (
                    ""
                  )}
                </ul>
                <div className="tab-content" id="pills-tabContent">
                  <div
                    className={
                      "tab-pane fade " + (piso == 1 ? "active show" : "")
                    }
                    id="pills-home"
                    role="tabpanel"
                    aria-labelledby="pills-home-tab"
                  >
                    <div className="row">
                      <div className="col-3">
                        <div className="tipo-a">
                          <img src="img/a-azul.svg" />
                          <p>Ejecutivo</p>
                        </div>
                        <div className="tipologia">
                          <div>
                            <img src="img/bullet-disponible.svg" />
                            Disponible
                          </div>
                          <div>
                            <img src="img/bullet-elegido.svg" />
                            Elegido
                          </div>
                          <div>
                            <img src="img/bullet-reservado.svg" />
                            Reservado
                          </div>
                        </div>
                      </div>
                      <div className="col-9">
                        <div className="bus piso-1">
                          <div className="fila">
                            <div className="columna conductor"></div>
                            <div className="columna"></div>
                            <div className="columna"></div>
                            <div className="columna"></div>
                            <div className="columna"></div>
                          </div>

                          {props.asientos1 ? (
                            <>
                              {props.asientos1.map((i, k) => {
                                currentSeatIndex = k;
                                return (
                                  <div
                                    key={`fila-asiento-${k}`}
                                    className="fila"
                                  >
                                    {i.map((ii, kk) => {
                                      return (
                                        <div
                                          key={`columna-asiento-${kk}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            props.tomarAsiento(
                                              ii,
                                              props,
                                              props.k,
                                              1,
                                              props.stage
                                            );
                                          }}
                                          className={
                                            "columna " + asientoClass(ii)
                                          }
                                          data-tip={`tarifa asiento ${ii.tarifa}`}
                                          data-for={`tooltip-asiento-${currentSeatIndex}`}
                                        >
                                          <span>
                                            {ii.asiento !== "B1" &&
                                            ii.asiento !== "B2" &&
                                            ii.estado !== "sinasiento" &&
                                            ii.tipo !== "pet"
                                              ? ii.asiento
                                              : ""}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })}
                              {function () {
                                let max = 10 - props.asientos1.length;
                                let n = 0;
                                let liens = [];
                                while (n < max) {
                                  liens.push(
                                    <div
                                      key={`fila-asiento-${n}`}
                                      className="fila"
                                    ></div>
                                  );
                                  n++;
                                }
                                return liens;
                              }.call(this)}
                            </>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={
                      "tab-pane fade " + (piso == 2 ? "active show " : "")
                    }
                    id="pills-profile"
                    role="tabpanel"
                    aria-labelledby="pills-profile-tab"
                  >
                    <div className="row">
                      <div className="col-3">
                        <div className="tipo-a">
                          <img src="img/a-azul.svg" />
                          <p>Semi Cama</p>
                        </div>
                        <div className="tipo-a">
                          <img src="img/am-azul.svg" />
                          <p>Mascotas a bordo</p>
                        </div>
                        <div className="tipologia">
                          <div>
                            <img src="img/bullet-disponible.svg" />
                            Disponible
                          </div>
                          <div>
                            <img src="img/bullet-elegido.svg" />
                            Elegido
                          </div>
                          <div>
                            <img src="img/bullet-reservado.svg" />
                            Reservado
                          </div>
                        </div>
                      </div>
                      <div className="col-9">
                        <div className="bus piso-2">
                          <div className="fila">
                            <div className="columna conductor"></div>
                            <div className="columna"></div>
                            <div className="columna"></div>
                            <div className="columna"></div>
                            <div className="columna"></div>
                          </div>
                          {props.asientos2 ? (
                            <>
                              {props.asientos2.map((i, k) => {
                                return (
                                  <div
                                    key={`fila-asientos2-${k}`}
                                    className="fila"
                                  >
                                    {i.map((ii, kk) => {
                                      return (
                                        <div
                                          key={`columna-asientos2-${kk}`}
                                          className={
                                            "columna " + asientoClass(ii)
                                          }
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            props.tomarAsiento(
                                              ii,
                                              props,
                                              props.k,
                                              2,
                                              props.stage
                                            );
                                          }}
                                        >
                                          <span>
                                            {ii.asiento != "B1" &&
                                            ii.asiento != "B2" &&
                                            ii.estado != "sinasiento" &&
                                            ii.tipo != "pet"
                                              ? ii.asiento
                                              : ""}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })}

                              {function () {
                                let max = 10 - props.asientos2.length;
                                let n = 0;
                                let liens = [];
                                while (n < max) {
                                  liens.push(
                                    <div
                                      key={`fila-asiento-${n}`}
                                      className="fila"
                                    ></div>
                                  );
                                  n++;
                                }
                                return liens;
                              }.call(this)}
                            </>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-center py-1">
                    Cantidad de asientos:{" "}
                    <strong>
                      {Array.isArray(props.asientos_selected)
                        ? props.asientos_selected.length
                        : 0}
                    </strong>
                  </p>
                </div>
                <div className="col-12  d-flex justify-content-center mb-3">
                  <div className="px-3 px-md-0 mt-3 mt-md-0 col-12 col-md-6">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.stopPropagation();
                        props.setPasaje(props);
                        props.setStage(2)
                      }}
                      className={
                        "btn " +
                        (props.asientos_selected?.length === 0
                          ? "disabled"
                          : "")
                      }
                    >
                      Comprar ($
                      {getSubtotal(props.asientos_selected).toLocaleString(
                        "pt"
                      )}
                      )
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Boleto;
