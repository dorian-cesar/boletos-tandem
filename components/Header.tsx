import useUser from 'lib/useUser'
import { useRouter } from 'next/router'
import Login from 'components/Login'
import { useLocalStorage } from 'hooks/useLocalStorage';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Header({
  openNav

}: {
  openNav:any
  
}) {
  const [user, setUser] = useState();
  const router = useRouter()
  const { getItem, clear } = useLocalStorage();

  useEffect(() => {
    setUser(getItem('user'));
  }, [])
  
  return (
    <>
      <header>
      <div className="menu">
        <div className="container">
          <div className="row">
            <div className="col-2 col-sm-2">
              <span style={{fontSize:"30px",cursor:"pointer",color:"#eb7f33"}} onClick={openNav}>☰</span>
            </div>
            <div className="col-6 col-sm-8 d-flex align-items-center justify-content-center">
              <a href="/"><img src="/img/logo-pullmanbus.svg" className="img-fluid" /></a>
            </div>
            <div className="col-4 col-sm-2 d-flex justify-content-end">
            {user == null ? (
                  <button type="button" className="btn btn-login" data-bs-toggle="modal" data-bs-target="#loginModal">
                    Iniciar sesión
                  </button> 
            ):(
              <ul className="nav nav-pills">
{/*                 <li className="nav-item">
                <h5 className="nav-link">¡Hola <b>{user?.nombres}</b>!</h5>
                </li> */}
              <li className="nav-item dropdown">
{/*                 <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">

                </a> */}
                <button  className="nav-link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                  <span className='text-login'>Mi cuenta</span>
                  <img src="img/icon-user.svg" width={30} className="m-1"/>
                </button>
                <ul className="dropdown-menu">
                <li><Link href="/mi-perfil" legacyBehavior><a className="dropdown-item" href="/mi-perfil">Mi perfil</a></Link></li>
                  <li><Link href="/mis-compras" legacyBehavior><a className="dropdown-item" href="/mis-compras">Mis compras</a></Link></li>
                  <li><Link href="/cambio-password" legacyBehavior><a className="dropdown-item" href="/cambio-password">Cambiar contraseña</a></Link></li>
                  <li><hr className="dropdown-divider"/></li>
                  <li><button type='button' className="dropdown-item" onClick={(e) => clear() }>Cerrar sesión</button></li>
                </ul>
              </li>
              </ul>
            )}
            </div>
          </div>
        </div>
      </div>
    </header>
    <Login></Login>
  </>
  )
}
