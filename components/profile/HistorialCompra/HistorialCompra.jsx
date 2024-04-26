import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useForm } from "/hooks/useForm";
import styles from "./HistorialCompra.module.css";
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

const HistorialCompra = () => {
  const { formState: data, onInputChange } = useForm(actualizarFormFields);
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const router = useRouter();
  const { getItem } = useLocalStorage();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [historial, setHistorial] = useState([]);
  const [boleto, setBoleto] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageBoleto, setCurrentPageBoleto] = useState(1);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [transaccion, setTransaccion] = useState("");

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
        .post("/api/user/historial-compra", {
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
            <td>{itemHistorial.cantidadBoletos}</td>
            <td>{clpFormat.format(itemHistorial.monto)}</td>
            <td className={styles["boton-descargar"]}>
              <img
                width={24}
                src="/img/icon/general/search-outline.svg"
                onClick={()=> abrirPopTransaccion(itemHistorial.codigo)}
              />
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

  const totalPagesBoletos = Math.ceil(boleto.length / itemsPerPage);

  const handlePageChangeBoleto = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPagesBoletos) {
      setCurrentPageBoleto(pageNumber);
    }
  };

  const handleNextPageBoleto = () => {
    if (currentPageBoleto < totalPagesBoletos) {
      setCurrentPageBoleto(currentPageBoleto + 1);
    }
  };

  const handlePreviousPageBoleto = () => {
    if (currentPageBoleto > 1) {
      setCurrentPageBoleto(currentPageBoleto - 1);
    }
  };

  const renderPaginationBoleto = () => {
    const pages = [];
    const maxVisiblePages = 3;
    const startPage = Math.max(
      1,
      currentPageBoleto - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPagesBoletos);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li
          key={i}
          className={`page-item ${currentPageBoleto === i ? "active" : ""}`}
        >
          <a className="page-link" onClick={() => handlePageChangeBoleto(i)}>
            {i}
          </a>
        </li>
      );
    }

    if (currentPageBoleto > 1) {
      pages.unshift(
        <li key="previous" className="page-item">
          <a
            className="page-link"
            aria-label="Previous"
            onClick={handlePreviousPageBoleto}
          >
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
      );
    }

    if (currentPageBoleto < totalPagesBoletos) {
      pages.push(
        <li key="next" className="page-item">
          <a
            className="page-link"
            aria-label="Next"
            onClick={handleNextPageBoleto}
          >
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      );
    }

    return pages;
  };

  const boletoDetalle = useMemo(
    function renderHistorial() {
      if (boleto.length === 0) {
        return <h3>No hay registros</h3>;
      } else {
        return boleto.map((itemBoleto, index) => (
          <tr key={index}>
            <td>{itemBoleto.boleto}</td>
            <td>{itemBoleto.origen}</td>
            <td>{itemBoleto.fechaEmbarcacion}</td>
            <td className={styles["boton-descargar"]}>
              {itemBoleto.puedeImprimir ? <img
                src="/img/icon/general/download-outline.svg"
                onClick={ ()=> descargarBoleto(itemBoleto.boleto)}
              /> : ""}
            </td>
          </tr>
        ));
      }
    },
    [boleto, currentPageBoleto, mostrarPopup]
  );

  const tablaArmada = (
    <div className={styles["menu-central"]}>
      <table className={`table ${styles["tabla-informacion"]}`}>
        <thead>
          <tr>
            <th scope="col">Boleto</th>
            <th scope="col">Origen</th>
            <th scope="col">Fecha embarque</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>{!isLoading ? boletoDetalle : ""}</tbody>
      </table>
      <nav aria-label="Page navigation example">
        <ul className={`pagination ${styles["pagination-css"]}`}>
          {renderPaginationBoleto()}
        </ul>
      </nav>
    </div>
  );

  const abrirPopTransaccion = (transaccion) => {
    {
      setTransaccion(transaccion)
      axios
        .post("/api/user/historial-compra-boletos", {
          codigo: transaccion,
        })
        .then(({ data }) => {
          setBoleto(data.object);
          abrirPopup();
        })
        .catch((error) => console.log("ERROR:::", error));
    }
  };

  const descargarBoleto = async (boletoBuscar) =>{
    let boleto = {
      codigo: transaccion,
      boleto: boletoBuscar
    }
        try {
        const res = await axios.post("/api/voucher", boleto);
        if (res.request.status) {
           const linkSource = `data:application/pdf;base64,${res.data?.archivo}`;
           const downloadLink = document.createElement("a");
           const fileName = res.data.nombre;
           downloadLink.href = linkSource;
           downloadLink.download = fileName;
           downloadLink.click();
        }
      } catch (e) {}

  }

  return (
    <>
      <div className={styles["menu-central"]}>
        <h1 className="title-historial">Historial de compras</h1>
        <span>
          Mantén un registro de todos los viajes realizados. Recuerda que solo
          podrás descargar tu pasaje mientras esté activo.
        </span>
        <table className={`table ${styles["tabla-informacion"]}`}>
          <thead>
            <tr>
              <th scope="col">Código Transacción</th>
              <th scope="col">Fecha Compra</th>
              <th scope="col">Cantidad Boletos</th>
              <th scope="col">Monto</th>
              <th scope="col">Ver boletos</th>
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
            modalKey={ModalEntities.detail_ticket}
            modalClose={cerrarPopup}
            modalBody={tablaArmada}
            modalMethods={cerrarPopup}
          />
        )}
      </div>
    </>
  );
};

export default HistorialCompra;
