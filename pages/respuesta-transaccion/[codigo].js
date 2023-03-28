import axios from 'axios'
import Layout from 'components/Layout'
import Footer from 'components/Footer'
import Image from 'next/image'
import { useEffect, useState, forwardRef } from 'react'
import { withIronSessionSsr } from 'iron-session/next'
import { sessionOptions } from 'lib/session'
import getConfig from 'next/config'
import dayjs from 'dayjs'
import DatePicker from 'react-datepicker'
import Link from 'next/link'
const { publicRuntimeConfig } = getConfig();
const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <input type="text" className="fecha-input form-control" onClick={onClick} ref={ref} value={value} />
    
));
export default function Home(props) {
    console.log('PROPS::::', props)
  return (
    <Layout>
      {
        props.carro ? (
          <div className="confirmacion py-5">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-10">
                  <div className="row justify-content-center mb-5">
                    <div className="col-8 text-center top">
                      <img src="img/icon-confirmado.svg" alt="" />
                      <h2>¡Muchas gracias por tu compra!</h2>
                      <p>Tu compra se ha realizado con éxito. <br />Dentro de poco te llegará un mail con la facturación del pasaje.</p>
                    </div>
                  </div>
                  <div className="block-top">
                    <div className="row">
                      <div className="col-12">
                        <h2>Orden de compra: {props.codigo}</h2>
                      </div>
                    </div>
                  </div>
                  <div className="block">
                    {
                      props.carro.carro.boletos.map((i)=>{
                        
                          return ( 
                          <div className="row mb-5">
                          <div className="col-12 col-md-4">
                            <h2>Datos del pasajero</h2>
                            <p><strong>{i.imprimeVoucher.cliente}</strong></p>
                            <p>{i.rut}</p>
                            <a href={"/api/voucher?codigo="+props.codigo+"&boleto="+i.boleto} target="_blank">Descarga tu boleto</a>
                          </div>
                          <div className="col-12 col-md-8 mt-4 mt-md-0">
                            <div className="row">
                              <div className="col-3">
                                <strong>{i.boleto}</strong>
                              </div>
                            
                              <div className="col-9">
                                <div className="w-100 mb-3">
                                  <span><strong className="d-inline">{i.imprimeVoucher.nombreTerminalOrigen}</strong> / {i.imprimeVoucher.nombreTerminalOrigen}</span> <br />
                                  <span>{i.imprimeVoucher.horaSalida} /  {i.imprimeVoucher.fechaSalida}</span>
                                </div>
                                <div className="w-100">
                                <span><strong className="d-inline">{i.imprimeVoucher.nombreTerminalDestino}</strong> / {i.imprimeVoucher.nombreTerminalDestino}</span> <br />
                                  <span>{i.imprimeVoucher.horaLlegada} /  {i.imprimeVoucher.fechaLlegada}</span>
                                </div>
                              
                              </div>
                            </div>
                          
                        </div></div>)
                      })
                    }
                  
                  
                    <div className="row mb-5">
                      <div className="col-6">
                        <p><strong>{props.carro.carro.boletos.length}X boleto Semi Cama</strong></p>
                        <h3>Total Pagado</h3>
                        <p>{props.carro.carro.tipoPago == 'VD'?"DEBITO":"CREDITO"}</p>
                      </div>
                      <div className="col-6 d-flex justify-content-end align-items-center">
                        <h4>${props.carro.carro.montoFormateado}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="row mt-5">
                    <div className="col-12 col-md-8 mb-3 mb-md-0">
                    
                    </div>
                    <div className="col-12 col-md-4">
                      <a href="/" className="btn">Ir al inicio</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className='row justify-content-center mb-5'>
              <div className='text-center mt-5'>
                <h1>Lo sentimos 😢,</h1>
                <h2>no se pudo llevar a cabo la transacción</h2>
                <h2>de tu compra.</h2>
              </div>
              <div className='text-center mt-5'>
                <h5>Por favor, intentelo nuevamente.</h5>
              </div>
              <div className='mt-5 mb-5 col-lg-2'>
                <Link className='btn-outline' href='/'>Salir</Link>
              </div>
            </div>
          </>
        )
      }
      <Footer />
    </Layout>
  )
}


export const getServerSideProps = withIronSessionSsr(async function (context) {
    let carro = {};
    
    try {
      carro = await axios.post(publicRuntimeConfig.site_url + "/api/carro",context.query)
    } catch (error) {
    }

    return {
      props: { codigo: context.query.codigo || '', token: context.query.token_ws || '', carro: carro.data || null },
    }
},
sessionOptions)
