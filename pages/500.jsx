import Link from 'next/link'
import React from 'react'

export default function Custom500() {
  return (
    <main className='custom-error-page'>
        <div>
            <img src='img/server_error_image.png' width={ 306 } height={ 228 }/>
            <span>¡Oops! hemos tenido problemas con nuestro servidor, estamos trabajando para solucionarlo.</span>
            <Link href={ '/' }>
                <button className='btn btn-primary'>
                    Regresar
                </button>
            </Link>
        </div>
    </main>
  )
}
