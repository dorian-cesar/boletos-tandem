'use client';
import Link from 'next/link';
import React from 'react'

export default function Custom404() {
  return (
    <main className='custom-error-page'>
        <div>
            <img src='img/not_found_error_image.png' width={ 306 } height={ 228 }/>
            <span>¡Oops! la página no fue encontrada, te suguerimos regresar.</span>
            <Link href={ '/' }>
                <button className='btn'>
                    Regresar
                </button>
            </Link>
        </div>
    </main>
  )
}