import { useEffect, useState } from "react";
import styles from "./ModoDevolucion.module.css";
import LocalStorageEntities from "entities/LocalStorageEntities";
import { decryptData } from "utils/encrypt-data.js";
import Popup from "../../Popup/Popup";
import ModalEntities from "../../../entities/ModalEntities";
import axios from "axios";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const ModoDevolucion = (props) => {
    const { medioDevolucion, setMedioDevolucion, setStage, boletos } = props;

    const [user, setUser] = useState(null);
    const [popUpBoletoUsuarioDistinto, setPopUpBoletoUsuarioDistinto] =
        useState(false);
    const [popUpDevolucionWallet, setPopUpDevolucionWallet] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	const router = useRouter();

	useEffect(() => {
		if( error?.status ) {
			toast.error(error?.errorMsg, {
				position: "top-right",
				autoClose: 5000,
				hideProgressBar: false,
			});
		}
	}, [error])

    useEffect(() => {
        const localUser = decryptData(LocalStorageEntities.user_auth);
        setUser(localUser);
    }, []);

    const handleMedioDevolucionChange = (e) => {
        setMedioDevolucion(e.target.value);
    };

    function volverAtras() {
        setStage(1);
    }

    function siguiente() {
        if (medioDevolucion === "monedero") {
            const boletosFiltrados = boletos.find(
                (boleto) => boleto.imprimeVoucher.cliente !== user.mail
            );

            if (boletosFiltrados) {
                setPopUpBoletoUsuarioDistinto(true);
            } else {
                setPopUpDevolucionWallet(true);
            }
        } else {
            setStage(3);
        }
    }

    async function procesarDevolucionWallet() {
        const boletosAnular = boletos.map((boleto) => boleto.boleto);

        const informacionDevolucion = {
            anulacionWallet: true,
            integrador: 1000,
            email: user.mail,
            rutTitular: user.rut,
            boleto: boletosAnular,
            codigoTransaccion: boletos[0].codigo,
            rutSolicitante: user.rut,
            usuario: user.nombres,
            banco: "",
            tipoCuenta: "",
            numeroCuenta: "",
        };

        try {
            setIsLoading(true);
            const response = await axios.post(
                "/api/anulacion",
                informacionDevolucion
            );
			debugger;
            if (response.data.status) {
                setIsLoading(false);
                setPopUpDevolucionWallet(false);
                router.push('/profile/home');
            }
        } catch (e) {
			setPopUpDevolucionWallet(false);
            if (!!e.response) {
                const { message } = e.response?.data;
                setError({ status: true, errorMsg: message });
            } else {
                setError({
                    status: true,
                    errorMsg: "Ocurrió un error inesperado.",
                });
            }
            setIsLoading(false);
        }
    }

    return (
        <>
            <div className={styles["container"]}>
                <div className={"fila"}>
                    <div className={styles["title"]}>Devolución de boleto</div>
                    <div className={styles["sub-title"]}>
                        Antes de efectuar la anulación del pasaje, selecciona la
                        opción qué más te acomoda:
                    </div>

                    <div className={"col-12"}>
                        <div className={"row justify-content-center mb-3"}>
                            <div className={styles["dotted"]}></div>
                        </div>
                    </div>
                    <div className={"col-12"}>
                        <div className={"row justify-content-center"}>
                            <div className={"col-6"}>
                                <div className={styles["option-normal"]}>
                                    <div>
                                        <input
                                            type="checkbox"
                                            checked={
                                                medioDevolucion === "normal"
                                            }
                                            value="normal"
                                            name="medioDevolucion"
                                            onChange={
                                                handleMedioDevolucionChange
                                            }
                                            disabled={isLoading}
                                        />
                                        <label className={styles["label"]}>
                                            &nbsp; Devolución al medio de pago
                                        </label>
                                    </div>
                                    <div>
                                        <div className={styles["option-text"]}>
                                            Puedes solicitar la devolución de
                                            los pasajes al mismo medio de pago,
                                            aunque la empresa se reserva el
                                            derecho de retener el 15% del valor
                                            del pasaje (Art. 67d.s. 212), siendo
                                            la devolución del 85% del valor del
                                            pasaje.
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={"col-5"}>
                                <div className={styles["option-normal"]}>
                                    <div>
                                        <input
                                            type="checkbox"
                                            checked={
                                                medioDevolucion === "monedero"
                                            }
                                            value="monedero"
                                            name="medioDevolucion"
                                            onChange={
                                                handleMedioDevolucionChange
                                            }
                                            disabled={!user && isLoading}
                                        />
                                        <label className={styles["label"]}>
                                            {" "}
                                            &nbsp; Monedero Virtual
                                        </label>
                                    </div>
                                    <div>
                                        <div className={styles["option-text"]}>
                                            Puedes pasar el 100% valor del
                                            pasaje al monedero virtual, pero una
                                            vez en el monedero el dinero no
                                            puede ser transferido a una cuenta
                                            débito o ser solicitado en efectivo
                                            en nuestras boleterías ya que se
                                            asumirá que será utilizado en un
                                            próximo viaje.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={"row"}>
                        <div className={"col-12 col-md-6"}>
                            <div
                                className={styles["button-back"]}
                                onClick={() => {
                                    if (!isLoading) volverAtras();
                                }}
                            >
                                regresar
                            </div>
                        </div>
                        <div className={"col-12 col-md-6"}>
                            <div
                                className={
                                    medioDevolucion
                                        ? styles["button-continue"]
                                        : styles["button-continue-disabled"]
                                }
                                onClick={() => {
                                    medioDevolucion && !isLoading
                                        ? siguiente()
                                        : "";
                                }}
                            >
                                Continuar
                            </div>
                        </div>
                    </div>
                </div>
                {popUpBoletoUsuarioDistinto && (
                    <Popup
                        modalKey={ModalEntities.user_ticket_not_equals_buy}
                        modalClose={() => setPopUpBoletoUsuarioDistinto(false)}
                        modalMethods={() =>
                            setPopUpBoletoUsuarioDistinto(false)
                        }
                    />
                )}
                {popUpDevolucionWallet && (
                    <Popup
                        modalKey={ModalEntities.return_to_wallet}
                        modalClose={() => setPopUpDevolucionWallet(false)}
                        modalMethods={() => procesarDevolucionWallet()}
                    />
                )}
            </div>
        </>
    );
};

export default ModoDevolucion;
