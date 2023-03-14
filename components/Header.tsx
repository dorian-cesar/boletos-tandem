import Link from 'next/link'
import useUser from 'lib/useUser'
import { useRouter } from 'next/router'


export default function Header({
  openNav

}: {
  openNav:any
  
}) {
  const { user, mutateUser } = useUser()
  const router = useRouter()

  return (
    
    <header>
    <div className="menu">
      <div className="container">
        <div className="row">
          <div className="col-3">
            <span style={{fontSize:"30px",cursor:"pointer",color:"#eb7f33"}} onClick={openNav}>☰</span>
          </div>
          <div className="col-6 d-flex align-items-center justify-content-center">
            <a href="/"><img src="/img/logo-pullmanbus.svg" className="img-fluid" /></a>
          </div>
          <div className="col-3 d-flex justify-content-end">
          {/*user?.isLoggedIn === false ? (
            <li>
              <Link href="/login">
                <a>Login</a>
              </Link>
            </li>
          ):(<a href="#" className="d-flex justify-content-end"><img src="img/icon-perfil.svg" /></a>)*/}
            
          </div>
        </div>
      </div>
    </div>
  </header>

   
  )
}
