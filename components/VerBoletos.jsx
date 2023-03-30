import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { useTable, usePagination } from "react-table";

const VerBoletos = ({compra}) => {
    const columns = useMemo(
        () => [
          {
            Header: "Boleto",
            accessor: "boleto",
          },
          {
            Header: "Fecha",
            accessor: "imprimeVoucher.fechaSalida",
          },
          {
            Header: "Hora",
            accessor: "imprimeVoucher.horaSalida",
          },
          {
            Header: "Origen",
            accessor: "imprimeVoucher.nombreCiudadOrigen",
          },
          {
            Header: "Destino",
            accessor: "imprimeVoucher.nombreCiudadDestino",
          },
          {
            Header: "Asiento",
            accessor: "imprimeVoucher.asiento",
          },
          {
            Header: "Valor",
            accessor: "imprimeVoucher.total",
          }
        ],
        []
    );
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const tableInstance = useTable({ columns, data, initialState: { pageIndex: 0, pageSize: 5 } }, usePagination);
    const { 
        getTableProps, 
        getTableBodyProps, 
        headerGroups, 
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        state: { pageIndex, pageSize }, } =
        tableInstance;

    useEffect(() => {
        const getBoletos = async () => {
            setIsLoading(true);
            try {
                const res = await axios.post("/api/obtener-boletos-codigo", {...compra});
                if(res.data.status){
                    setData(res.data?.object);
                }
                setIsLoading(false);
            } catch (e){
                console.log(e);
                setIsLoading(false);
            }
        }
        if(compra != null){
            getBoletos();
        }
    }, [compra]);
        
    return (
        <>
        <div className="modal fade" id="verBoletosModal" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className={'modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl'}>
                <div className="modal-content">
                    <div className="modal-body">
                        <div className="container">
                        <h1 className="titulo-azul text-center">
                            Detalle boletos
                        </h1>
                        <div className="d-flex justify-content-center mt-2 mb-4">
                            <a data-bs-dismiss="modal" href="">Volver</a>
                        </div>
                        {isLoading ? 
                            <div className="d-flex justify-content-center">
                                <div className="spinner-border text-primary" role="status">
                                    <span clasNames="visually-hidden"></span>
                                </div>
                            </div>:
                            (
                            <>
                            <table className="table table-striped align-middle table-borderless" {...getTableProps()}>
                                <thead className="fondo-naranja">
                                {headerGroups.map(headerGroup => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                                    ))}
                                    <th>Descargar</th>
                                    </tr>
                                ))}
                                </thead>
                                <tbody {...getTableBodyProps()}>
                                {page.map((row, i) => {
                                    prepareRow(row)
                                    return (
                                    <tr {...row.getRowProps()}>
                                        {row.cells.map(cell => {
                                        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                        })}
                                        <td>
                                            <a className="btn btn-table" href={"/api/voucher?codigo="+row?.original?.codigo+"&boleto="+row?.original?.boleto} target="_blank">
                                                Descargar
                                            </a>
                                        </td>
                                    </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                            <div className="pagination">
                                <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="btn btn-paginador">
                                {'<<'}
                                </button>{' '}
                                <button onClick={() => previousPage()} disabled={!canPreviousPage} className="btn btn-paginador">
                                {'<'}
                                </button>{' '}
                                <button onClick={() => nextPage()} disabled={!canNextPage} className="btn btn-paginador">
                                {'>'}
                                </button>{' '}
                                <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} className="btn btn-paginador">
                                {'>>'}
                                </button>{'  '}
                            </div>
                            </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default VerBoletos;