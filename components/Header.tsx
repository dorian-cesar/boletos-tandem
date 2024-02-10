'use client'

import useUser from "lib/useUser";
import { useRouter } from "next/router";
import Login from "components/Login";
import { useLocalStorage } from "hooks/useLocalStorage";
import { useEffect, useState } from "react";
import { useSelector } from 'react-redux'
import Link from "next/link";

export default function Header({ openNav }: { openNav: any }) {
  const [user, setUser] = useState();
  const router = useRouter();
  const { getItem, clear } = useLocalStorage();

  const carroCompras = useSelector((state:any) => state.compra?.listaCarrito) || []
  
  useEffect(() => {
    setUser(getItem("user"));
  }, []);

  return (
    <>
      <header>
       
          <div className="container">
            <div className="row">
              <div className="col-2 col-sm-1">
                <span onClick={openNav}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="42"
                    height="42"
                    viewBox="0 0 42 42"
                    fill="none"
                  >
                    <path
                      d="M7.21875 12.4688H34.7812H7.21875ZM7.21875 21H34.7812H7.21875ZM7.21875 29.5312H34.7812H7.21875Z"
                      fill="#3365B4"
                    />
                    <path
                      d="M7.21875 12.4688H34.7812M7.21875 21H34.7812M7.21875 29.5312H34.7812"
                      stroke="#FF6500"
                      strokeWidth="3"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </div>
              <div className="col-6 col-sm-9 d-flex align-items-center ">
                <a href="/">
                  <img src="../img/icon/logos/Logo.svg" className="img-fluid" />
                </a>
              </div>
              <div className="col-4 col-sm-2 d-flex justify-content-end">       
                {user == null ? (
                  <img src="../img/icon/logos/cuenta.svg"
                  className="img-fluid" 
                  data-bs-toggle="modal"
                  data-bs-target="#loginModal"
                  />
                ) : (
                  <ul className="nav nav-pills">
                    <li className="nav-item dropdown">
                      <button
                        className="nav-link dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <span className="text-login">Mi cuenta</span>
                        <img
                          src="../img/icon-user.svg"
                          width={30}
                          className="m-1"
                        />
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <Link href="/profile/home" legacyBehavior>
                            <a className="dropdown-item" href="/mi-perfil">
                              Mi perfil
                            </a>
                          </Link>
                        </li>
                        <li>
                          <Link href="/profile/mis-compras" legacyBehavior>
                            <a className="dropdown-item" href="/mis-compras">
                              Mis compras
                            </a>
                          </Link>
                        </li>
                        <li>
                          <Link href="/profile/cambio-password" legacyBehavior>
                            <a
                              className="dropdown-item"
                              href="/profile/cambio-password"
                            >
                              Cambiar contraseña
                            </a>
                          </Link>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={(e) => clear()}
                          >
                            Cerrar sesión
                          </button>
                        </li>
                      </ul>
                    </li>
                  </ul>
                )}
                {/* <Link href="/carrito" legacyBehavior>
                  <a className="d-flex align-items-center">
                    <img src="../img/cart-outline.svg" width={30} />
                    <span className="badge bg-primary rounded-pill">
                      {carroCompras.length}
                    </span>
                  </a>
                </Link> */}
              </div>
            </div>
          </div>
        
      </header>
      <Login
      cuponera={0}>

      </Login>
    </>
  );
}
