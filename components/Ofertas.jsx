import { useEffect, useState, forwardRef } from "react";
import CardOferta from './card-oferta';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Navigation, Autoplay, Pagination } from 'swiper/modules';

const customStyles = {
  control: (provided) => ({
    ...provided,
    background: "var(--Azul-fondo, #E6ECF6)",
  }),
};

const ofertas = [{
  origen: 'Santiago',
  destino: 'La Serena',
  precioAnterior: '18.000',
  precio: '15.000',
  descuento: '20%',
  tipoBus: 'Semi Cama',
  mascota: true,
  vigencia: 'Enero 2024/Febrero 2024',
  srcImagen: ''
},
{
  origen: 'Santiago',
  destino: 'La Serena',
  precioAnterior: '18.000',
  precio: '15.000',
  descuento: '20%',
  tipoBus: 'Semi Cama',
  mascota: true,
  vigencia: 'Enero 2024/Febrero 2024',
  srcImagen: ''
},
{
  origen: 'Santiago',
  destino: 'La Serena',
  precioAnterior: '18.000',
  precio: '15.000',
  descuento: '20%',
  tipoBus: 'Semi Cama',
  mascota: true,
  vigencia: 'Enero 2024/Febrero 2024',
  srcImagen: ''
},
{
  origen: 'Santiago',
  destino: 'La Serena',
  precioAnterior: '18.000',
  precio: '15.000',
  descuento: '20%',
  tipoBus: 'Semi Cama',
  mascota: true,
  vigencia: 'Enero 2024/Febrero 2024',
  srcImagen: ''
},
{
  origen: 'Santiago',
  destino: 'La Serena',
  precioAnterior: '18.000',
  precio: '15.000',
  descuento: '20%',
  tipoBus: 'Semi Cama',
  mascota: true,
  vigencia: 'Enero 2024/Febrero 2024',
  srcImagen: ''
}]

const Ofertas = (props) => {

  useEffect(() => doSomething(), []);
  const [valoresArregloOfertas, setValoresArregloOfertas] = useState([]);


  function doSomething() {
    if ( valoresArregloOfertas.length > 0 ) {
      return;
    }

    const firstArray = [];
    let secondArray = [];

    ofertas.map((oferta) => {
      if( secondArray.length < 3 ) {
        secondArray.push(oferta);
      } else {
        firstArray.push(secondArray);
        secondArray = [];
        secondArray.push(oferta);
      }
    });

    if ( secondArray.length > 0 ) {
      firstArray.push(secondArray);
    }

    setValoresArregloOfertas(firstArray);
  }

  function renderCardOferta(firstArray) {
    if ( firstArray.length === 0 ) {
      return;
    } else if ( firstArray.length === 1 ) {
      return (
        <>
        <div className="col-12 col-md-6 col-lg-4"></div>
        <div className="col-12 col-md-6 col-lg-4"></div>
        </>
      );
    } else if ( firstArray.length === 2 ) {
      return (
        <>
        <div className="col-12 col-md-6 col-lg-4"></div>
        </>
      );

    }
  }


  return (
    <div className="container">
      <div className="title-ofertas">Ofertas destacadas</div>
      <div className="sub-title-ofertas">
        Infórmate sobre nuestros servicios, convenios y otros.
      </div>
      <Swiper
        className="mt-5 pb-5"
        centeredSlides={ true }
        loop={ true }
        navigation={ true }
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        slidesPerView={1}
        spaceBetween={30}
        modules={[Navigation, Autoplay, Pagination]}>
        {
          valoresArregloOfertas.map((firstArray, index) => (
            <SwiperSlide key={ index } className="row d-flex justify-content-around ps-5">
              { firstArray.map((oferta, index) => (<CardOferta key={ index } {...oferta} />)) }
              { renderCardOferta(firstArray) }
            </SwiperSlide>
          ))
        }
        </Swiper>
    </div>
  );
};

export default Ofertas;
