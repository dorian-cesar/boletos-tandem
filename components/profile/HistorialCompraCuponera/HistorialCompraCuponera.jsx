import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useForm } from "/hooks/useForm";
import styles from "./HistorialCompraCuponera.module.css";
import axios from "axios";
import { useId } from "react";
import { decryptData } from "utils/encrypt-data.js";
import LocalStorageEntities from "entities/LocalStorageEntities";
import Popup from "../../Popup/Popup";
import ModalEntities from "../../../entities/ModalEntities";

const actualizarFormFields = {
  rut: "",
  apellidoMaterno: "",
  apellidoPaterno: "",
  correo: "",
  correo2: "",
  fechaNacimiento: "",
  nombres: "",
  tipoDocumento: "R",
  sexo: "",
};

const estadoBoleto = {
  ACTI: "Activo",
  NUL: "Nulo",
};

const clpFormat = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

const itemsPerPage = 9;
const itemsPerPageBoleto = 5;

const HistorialCompraCuponera = () => {
  const { formState: data, onInputChange } = useForm(actualizarFormFields);
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const router = useRouter();
  const { getItem } = useLocalStorage();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [historial, setHistorial] = useState([]);
  const [cuponera, setCuponera] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [mostrarPopup, setMostrarPopup] = useState(false);

  const abrirPopup = () => {
    setMostrarPopup(true);
  };
  const cerrarPopup = () => {
    setMostrarPopup(false);
  };

  const id = useId();

  useEffect(() => {
    let checkUser = decryptData(LocalStorageEntities.user_auth);
    if (checkUser == null) router.push("/");
    setUser(checkUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    data.nombres = user?.nombres;
    data.apellidoPaterno = user?.apellidoPaterno;
    data.apellidoMaterno = user?.apellidoMaterno;
    data.genero = user?.genero;
    data.mail = user?.mail;
    data.mail2 = user?.mail2;
    data.rut = user?.rut;
    if (!!user?.fechaNacimiento) {
      let fecha = new Date(
        String(user?.fechaNacimiento).substring(
          0,
          String(user?.fechaNacimiento).length - 5
        )
      );
      setFechaNacimiento(fecha);
    }
  }, [user]);

  useEffect(() => {
    data.fechaNacimiento = fechaNacimiento;
  }, [fechaNacimiento]);

  useEffect(() => {
    if (user) {
      axios
        .post("/api/user/historial-compra-cuponera", {
          email: user.mail,
        })
        .then(({ data }) => {
          setHistorial(data.object);
        })
        .catch((error) => console.log("ERROR:::", error));
    }
  }, [user]);

  const MemoizedComponent = useMemo(
    function renderHistorial() {
      if (historial.length === 0) {
        return <h3>No hay registros</h3>;
      } else {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentItems = historial.slice(startIndex, endIndex);

        return currentItems.map((itemHistorial, index) => (
          <tr key={index}>
            <td>{itemHistorial.codigo}</td>
            <td>{itemHistorial.fechaCompraFormato}</td>
            <td>
              {itemHistorial.origen} - {itemHistorial.destino}
            </td>
            <td>{itemHistorial.vigenciaCuponera ? "Activa" : "Vencidad"}</td>
            <td>{clpFormat.format(itemHistorial.monto)}</td>
            <td className={styles["boton-descargar"]}>
              {itemHistorial.vigenciaCuponera ? (
                <img
                  width={24}
                  src="/img/icon/general/search-outline.svg"
                  onClick={() => abrirPopTransaccion(itemHistorial)}
                />
              ) : (
                ""
              )}
            </td>
          </tr>
        ));
      }
    },
    [historial, currentPage]
  );

  const totalPages = Math.ceil(historial.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 3;

    const startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li
          key={i}
          className={`page-item ${currentPage === i ? "active" : ""}`}
        >
          <a className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </a>
        </li>
      );
    }

    if (currentPage > 1) {
      pages.unshift(
        <li key="previous" className="page-item">
          <a
            className="page-link"
            aria-label="Previous"
            onClick={handlePreviousPage}
          >
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <li key="next" className="page-item">
          <a className="page-link" aria-label="Next" onClick={handleNextPage}>
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      );
    }

    return pages;
  };

  const tablaArmada = (
    <div className={styles["menu-central"]}>
      <div className={"col-12 text-center"}>
        <img
          src={`https://barcode.tec-it.com/barcode.ashx?data=${cuponera?.codigoSeguridad}&code=MobileQRCode&eclevel=L`}
          className="my-4"
          width="162"
          height="162"
        />
        <p className={styles["codigo-seguridad"]}>
          Código cuponera: {cuponera?.codigoSeguridad}
        </p>
      </div>
      <div className={"col-12"}>
        <span>Cantidad Cupones: </span>
        <b> {cuponera?.cantidadViajes + cuponera?.cantidadViajesExtras}</b>
      </div>
      <div className={"col-12"}>
        <span>Cantidad Cupones disponibles: </span>
        <b>{cuponera?.cantidadViajesRestantes}</b>
      </div>
    </div>
  );

  const abrirPopTransaccion = (cuponera) => {
    {
      setCuponera(cuponera);
      abrirPopup();
    }
  };

  return (
    <>
      <div className={styles["menu-central"]}>
        <h1 className="title-historial">Historial de compras cuponera</h1>
        <span>
          Mantén un registro de todos los viajes realizados con tu cuponera.
        </span>
        <table className={`table ${styles["tabla-informacion"]}`}>
          <thead>
            <tr>
              <th scope="col">Código Transacción</th>
              <th scope="col">Fecha Compra</th>
              <th scope="col">Origen - Destino</th>
              <th scope="col">Vigencia</th>
              <th scope="col">Monto</th>
              <th scope="col">Ver detalle</th>
            </tr>
          </thead>
          <tbody>{!isLoading ? MemoizedComponent : ""}</tbody>
        </table>
        <nav aria-label="Page navigation example">
          <ul className={`pagination ${styles["pagination-css"]}`}>
            {renderPagination()}
          </ul>
        </nav>
        {mostrarPopup && (
          <Popup
            modalKey={ModalEntities.detail_coupon}
            modalClose={cerrarPopup}
            modalBody={tablaArmada}
            modalMethods={cerrarPopup}
          />
        )}
      </div>
    </>
  );
};

export default HistorialCompraCuponera;
