import { useState } from "react";
import RecuperarPassword from 'components/RecuperarPassword'
import Registro from 'components/Registro'
import { useForm } from "/hooks/useForm";
import { useLocalStorage } from "/hooks/useLocalStorage";
import axios from "axios";

const loginFormFields = {
    correo: '',
    contraseña: ''
}

const Login = () => {
    const { formState: login, onInputChange } = useForm(loginFormFields);
    const { setItem } = useLocalStorage();
    const [mode, setMode] = useState("0");
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({
        msg: '',
        visible: false,
        type: ''
      });

    const changeMode = (mode) => {
        if(mode != null) setMode(mode);
    }

    const changeAlert = (alert) => {
        if(alert != null) setAlert(alert);
    }

    const onLogin = async () => {
        if(login.correo == '' || login.contraseña == ''){
            setAlert({
                msg: 'Rellene los campos vacios',
                visible: true,
                type: 'alert-danger'
            });
            return;
        } 

        try {
            console.log("Iniciando sesión...")
            setIsLoading(true);
            const res = await axios.post("/api/validar-login", {...login});
            const { token, usuario } = res.data.object;
            setItem('user', usuario);
            setItem('token', token);
            setIsLoading(false);
            const myModal = document.getElementById("loginModal");
            myModal.hidden = true;
            window.location.reload(false);
        } catch (e){
            console.log(e);
            setIsLoading(false);
            if(!!e.response){
                const { message } = e.response?.data;
                setAlert({
                    msg: message,
                    visible: true,
                    type: 'alert-danger'
                });
            } else {
                setAlert({
                    msg: 'Ocurrió un error inesperado',
                    visible: true,
                    type: 'alert-danger'
                });
            }
        }
        
    }

    return (
        <>
            <div className="modal fade" id="loginModal" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className={'modal-dialog modal-dialog-centered modal-dialog-scrollable'+ (mode == '2' ? ' modal-lg':'')}>
                    {mode == "0" ?
                    <div className="modal-content">
                        <div className="modal-body">
                            <div className="container">
                                <div className="d-flex justify-content-center">
                                    <img src="img/icon-foto.svg" width={75}></img>
                                </div>
                                <div className="d-flex justify-content-center mt-2">
                                    <h4 className="titulo-azul">¡Hola!</h4>
                                </div>
                                <div className="d-flex justify-content-center">
                                    Inicia sesión en pocos pasos
                                </div>
                                <div className="row mt-2">
                                    {alert.visible ?  
                                    <div className={'alert '+ alert?.type} role="alert">
                                    { alert?.msg }
                                    </div>:''
                                    }
                                </div>
                                {isLoading ? <div className="d-flex justify-content-center">
                                    <div className="spinner-border text-primary" role="status">
                                        <span clasNames="visually-hidden"></span>
                                    </div>
                                </div>:''}
                                <div className="row mt-2">
                                    <div className="col-12">
                                        <label className="label-input">Correo electrónico</label>
                                        <input 
                                            type="text" 
                                            placeholder="Ej: example@example.com" 
                                            className="form-control" 
                                            name="correo"
                                            value={ login?.correo }
                                            onChange={ onInputChange } 
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-12">
                                        <label className="label-input">Contraseña</label>
                                        <input 
                                            type="password" 
                                            placeholder="Ej: ******" 
                                            className="form-control" 
                                            name="contraseña"
                                            value={ login?.contraseña }
                                            onChange={ onInputChange } />
                                    </div>
                                </div>
                                <div className="d-flex justify-content-center">
                                    <button className="btn-link btn-modal-link" onClick={(e) => changeMode("1")}>¿Olvidé mi contraseña?</button>
                                </div>
                                <div className="d-flex justify-content-center">
                                    <button className="btn-link btn-modal-link" onClick={(e) => changeMode("2")}>Registrarme</button>
                                </div>
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-modal-primary" onClick={(e) => onLogin() }>Ingresar</button>
                            <button type="button" className="btn btn-modal-secondary" data-bs-dismiss="modal" aria-label="Close">Seguir como invitado</button>
                        </div>
                    </div>
                    : mode == "1" ? <RecuperarPassword onChangeMode={changeMode} onChangeAlert={changeAlert}></RecuperarPassword> : <Registro onChangeMode={changeMode} onChangeAlert={changeAlert}></Registro>}
                </div>  
            </div>
        </>
    )
}

export default Login;