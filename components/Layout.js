import Head from 'next/head'
import Header from 'components/Header'
import { useState } from 'react'
import Link from 'next/link'
export default function Layout({ children }) {
  const [open, setOpen] = useState(false)
  const closeNav = () => {
    setOpen(false)
  }
  const openNav = () => {
    setOpen(true)
  }
  return (
    <>
      <Head>
        <meta charset="UTF-8"/>
        <title>Pullman Bus</title>
      </Head>
    
      <Header openNav={openNav} />

      <main>
        {children}
      </main>
      <div id="myNav" className={"overlay " + (open ? "open":"")}>
      <a className="closebtn" onClick={closeNav}>×</a>
      <div className="overlay-content">
        <div className="links-menu">
          <div className="w-100"><Link href="/comprar" legacyBehavior ><a href="/comprar" className="compra">Compra</a></Link></div>
         {/* <div className="w-100"><a href="#" className="ofertas">Ofertas</a></div> */}
          <div className="w-100"><Link href="/confirmacion-boleto"legacyBehavior  ><a href="/confirmacion-boleto" className="conf-pasajes">Confirmación de pasajes</a></Link></div>
          <div className="w-100">
            <a className="te-ayudamos acopla" data-bs-toggle="collapse" href="#collapseTeAyudamos" role="button" aria-expanded="false" aria-controls="collapseTeAyudamos">Te ayudamos</a>
            <div className="collapse" id="collapseTeAyudamos">
              <div className="card-body">
              <Link href="/confirmacion-boleto" legacyBehavior ><a href="/confirmacion-boleto">Confirmación de boleto</a></Link>
              <Link href="/cambio-boleto" legacyBehavior ><a href="/cambio-boleto">Cambio de boleto</a></Link>
              <Link href="/devolucion" legacyBehavior ><a href="/cambio-boleto">Devolución de boletos</a></Link>
              </div>
            </div>
          </div>
          <div className="w-100"><a href="https://pullmanempresas.cl/#/sessions/signin?return=%2Fempresa%2Fhome" className="cliente-empresa">Cliente Empresas</a></div>
         {/* <div className="w-100"><a href="#" className="viajes-espaciales">Viajes especiales</a></div> */}
        
        </div>
        <div className="contactanos-menu mt-4">
          <span>Contáctanos en:</span>
          <a href="#" className="correo">clientes@pullmanbus.cl</a>
        </div>
        <div className="contactanos-menu">
          <span>Síguenos en:</span>
          <a href="#" className="face">@pullman.cl</a>
          <a href="#" className="insta">@pullmanbus</a>
        </div>
      </div>
    </div>
    </>
  )
}
