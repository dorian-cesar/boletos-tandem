import axios from 'axios'
import Layout from 'components/Layout'
import Footer from 'components/Footer'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState, forwardRef } from 'react'
import { withIronSessionSsr } from 'iron-session/next'
import { sessionOptions } from 'lib/session'
import getConfig from 'next/config'
import dayjs from 'dayjs'
import DatePicker, {registerLocale} from 'react-datepicker'
import Link from 'next/link'
import Input from '../components/Input'
const { publicRuntimeConfig } = getConfig();
import es from "date-fns/locale/es";
registerLocale("es", es);
const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <input type="text" className="fecha-input form-control" onClick={onClick} ref={ref} value={value} />
    
));
export default function Home(props) {
  const [mascota_allowed, setMascota] = useState(false)
  const [origen, setOrigen] = useState(null)
  const [destino, setDestino] = useState(null)
  const ciudades = props.ciudades;
  const promociones = props.promociones;
  const [destinos, setDestinos] = useState([]);


  const getDestinos = async() => {
    if( origen !== null ) {
      let { data } = await axios.post("/api/destinos",{ id_ciudad: origen });
      setDestinos(data);
    }
  }

  useEffect(()=>{
    (async () => await getDestinos())();
  },[origen]);

  const [startDate, setStartDate] = useState(dayjs().toDate());
  const [endDate, setEndDate] = useState(null);
  useEffect(()=>{
    if(endDate && dayjs(startDate).isAfter(dayjs(endDate))){
      setEndDate(dayjs(startDate).toDate())
    }
  },[startDate])
 
  const isValidStart = (date) => {
    return dayjs(date).isAfter(dayjs().subtract(1,'day')) && dayjs(date).isBefore(dayjs().add(props.dias,'day'));
    
  }
  const isValidAfter = (date) => {
    return dayjs(date).isAfter(dayjs(startDate).subtract(1,'day')) && dayjs(date).isBefore(dayjs().add(props.dias,'day'));
    
  }
  console.log(ciudades, destinos, destino)
  return (
    <Layout>
      <Head>
        <title>PullmanBus | Inicio</title>
      </Head>
      <div className="home">
         <div className="img-principal d-none d-md-block">
           <img src="/banner-1.png" />
         </div>
         <div className="img-principal d-block d-md-none">
           <img src="/banner-mobile.png" />
         </div>
         <div className="container pb-5">
           <div className="row ">
             <div className="col-12">
               <div className="bloque m-neg">
                 <div className="row mb-3 ">
                   <div className="col-12 col-md-6">
                     <h1 className="titulo-azul">Detalles de tu viaje</h1>
                   </div>
                   <div className="col-12 col-md-6">
                     <div className="d-flex w-100 justify-content-end align-items-center"  onClick={()=>setMascota(!mascota_allowed)}>
                       <img src="img/icon-patita.svg" style={{marginRight: '5px'}}/>
                       <span>Mascota a bordo</span>
                       <label className={"switch " + (mascota_allowed?"checked":"")}>
                        
                         <span className="slider round"></span>
                       </label> 
                     </div>
                   </div>
                 </div>
                 <div className="row search-row">
                   <div className="col-12 col-md-6 col-lg-3">
                     <div className="grupo-campos">
                       <label className="label-input">¿De dónde viajamos?</label>
                       <Input className="sel-input origen" placeholder="Origen" items={ciudades.map((i)=> {return {value: i.codigo, label:i.nombre}})} selected={origen?[ciudades.find((i)=>i.codigo == origen)].map((i)=> {return {value: i.codigo, label:i.nombre}}):""} setSelected={setOrigen} />
                     </div>  
                   </div>
                   <div className="col-12 col-md-6 col-lg-3">
                     <div className="grupo-campos">
                       <label className="label-input">¿A dónde viajamos?</label>
                       <Input className="sel-input destino" placeholder="Destino" items={destinos.map((i)=> {return {value: i.codigo, label:i.nombre}})} selected={destino && destinos.length >0?[destinos.find((i)=>i.codigo == destino)].map((i)=> {return {value: i.codigo, label:i.nombre}}):""} setSelected={setDestino} />
                     </div>
                   </div>
                   <div className="col-6 col-md-6 col-lg-2">
                      <div className="grupo-campos">
                        <label className="label-input">¿Fecha de ida?</label>
                        <DatePicker
                          selected={startDate}
                          onChange={(date) => setStartDate(date)}
                          filterDate={isValidStart}
                          placeholderText={""}
                          locale={"es"}
                          dateFormat="dd/MM/yyyy"
                          customInput={<CustomInput />}
                        />
                      </div>
                   </div>
                   <div className="col-6 col-md-6 col-lg-2">
                     <div className="grupo-campos">
                       <label className="label-input">¿Fecha de regreso?</label>
                       <DatePicker
                          selected={endDate}
                          onChange={(date) => setEndDate(date)}
                          filterDate={isValidAfter}
                          placeholderText={""}
                          dateFormat="dd/MM/yyyy"
                          locale={"es"}
                          customInput={<CustomInput />}
                        />
                     </div>
                   </div>
                   <div className="col-12 col-md-12 col-lg-2">
                     <Link href={`/comprar?origen=${origen}&destino=${destino}&startDate=${startDate?dayjs(startDate).format("YYYY-MM-DD"):""}&endDate=${endDate?dayjs(endDate).format("YYYY-MM-DD"):""}`} legacyBehavior >
                       <a className="btn btn-fix" href="">
                        <img src="img/icon-buscar-blanco.svg"/> Buscar servicios
                      </a> 
                     </Link> 
                   </div>
                 </div>
               </div>
             </div>
           </div>

           {/* <div className="row mt-5">
             <div className="col-12 py-4 text-center">
               <h2 className="titulo-azul">Ofertas Destacadas</h2>
               <p>Infórmate sobre nuestros servicios, convenios y otros</p>
             </div>
             {
               promociones.map((i)=>{
                 console.log(i)
               })
             }
            <div className="col-12 col-md-4">
               <div className="bloque viaje-oferta">
                 <div className="top-img">
                   <img src="https://via.placeholder.com/600x250" className="img-fluid"/>
                   <span className="etiqueta">Ida y vuelta</span>
                 </div>
                 <div className="cont pt-4">
                   <span>Tramo</span>
                   <h3>Santiago</h3>
                   <h3>Puerto Varas</h3>
                   <p className="pt-3">Vigencia: <strong>Enero 2022 / Febrero 2022</strong></p>
                   <div className="item">
                     <img className="mr-2" src="img/icon-bus.svg"/>
                     Bus Salón Cama
                   </div>
                   <div className="item">
                     <img className="mr-2" src="img/icon-mascota.svg"/>
                     Mascota a Bordo
                   </div>
                 </div>
                 <div className="precio">
                   <p>Precio por persona</p>
                   <div className="d-flex">
                     <span className="precio-oferta align-items-center d-flex">$25.700</span>
                     <span className="precio-normal align-items-center justify-content-center d-flex">$33.800</span>
                   </div>
                 </div>
                 <a href="#" className="btn">Me interesa</a>
               </div>
             </div>
             <div className="col-12 col-md-4">
               <div className="bloque viaje-oferta">
                 <div className="top-img">
                   <img src="https://via.placeholder.com/600x250" className="img-fluid"/>
                   <span className="etiqueta">Ida y vuelta</span>
                 </div>
                 <div className="cont pt-4">
                   <span>Tramo</span>
                   <h3>Santiago</h3>
                   <h3>Puerto Varas</h3>
                   <p className="pt-3">Vigencia: <strong>Enero 2022 / Febrero 2022</strong></p>
                   <div className="item">
                     <img className="mr-2" src="img/icon-bus.svg"/>
                     Bus Salón Cama
                   </div>
                   <div className="item">
                     <img className="mr-2" src="img/icon-mascota.svg"/>
                     Mascota a Bordo
                   </div>
                 </div>
                 <div className="precio">
                   <p>Precio por persona</p>
                   <div className="d-flex">
                     <span className="precio-oferta align-items-center d-flex">$25.700</span>
                     <span className="precio-normal align-items-center justify-content-center d-flex">$33.800</span>
                   </div>
                 </div>
                 <a href="#" className="btn">Me interesa</a>
               </div>
             </div>
             <div className="col-12 col-md-4">
               <div className="bloque viaje-oferta">
                 <div className="top-img">
                   <img src="https://via.placeholder.com/600x250" className="img-fluid"/>
                   <span className="etiqueta">Ida y vuelta</span>
                 </div>
                 <div className="cont pt-4">
                   <span>Tramo</span>
                   <h3>Santiago</h3>
                   <h3>Puerto Varas</h3>
                   <p className="pt-3">Vigencia: <strong>Enero 2022 / Febrero 2022</strong></p>
                   <div className="item">
                     <img className="mr-2" src="img/icon-bus.svg"/>
                     Bus Salón Cama
                   </div>
                   <div className="item">
                     <img className="mr-2" src="img/icon-mascota.svg"/>
                     Mascota a Bordo
                   </div>
                 </div>
                 <div className="precio">
                   <p>Precio por persona</p>
                   <div className="d-flex">
                     <span className="precio-oferta align-items-center d-flex">$25.700</span>
                     <span className="precio-normal align-items-center justify-content-center d-flex">$33.800</span>
                   </div>
                   <div className="descuento">
                     -20%
                   </div>
                 </div>
                 <a href="#" className="btn">Me interesa</a>
               </div>
             </div>
           </div>*/}
         </div>  
       </div>
       <Footer />
    </Layout>
  )
}


export const getServerSideProps = withIronSessionSsr(async function ({
  req,
  res,
}) {
  let ciudades = await axios.get(publicRuntimeConfig.site_url + "/api/ciudades")
  let promociones = await axios.get(publicRuntimeConfig.site_url + "/api/promociones")
  let dias = await axios.get(publicRuntimeConfig.site_url + "/api/dias")
  return {
    props: { ciudades: ciudades.data, dias: dias.data, promociones: promociones.data },
  }
},
sessionOptions)
