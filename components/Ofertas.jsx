import { useEffect, useState, forwardRef } from "react";
import CardOferta from './card-oferta';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Navigation, Autoplay, Pagination, FreeMode } from 'swiper/modules';

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

  // useEffect(() => doSomething(), []);
  const [valoresArregloOfertas, setValoresArregloOfertas] = useState(ofertas);

  return (
    <div className="container">
      <div className="title-ofertas">Ofertas destacadas</div>
      <div className="sub-title-ofertas">
        Infórmate sobre nuestros servicios, convenios y otros.
      </div>
      <Swiper
        className="mt-5 pb-5 w-100"
        slidesPerView={3}
        spaceBetween={30}
        freeMode={true}
        loop={ true }
        navigation={ true }
        pagination={{ clickable: true }}
        modules={[FreeMode, Navigation, Pagination]}
        breakpoints={{
          500: {
            slidesPerView: 1,
            spaceBetween: 10
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 40,
          }
        }}>
        {
          valoresArregloOfertas.map((oferta, index) => (
            <SwiperSlide key={ index } id="swiper-ofertas">
              <CardOferta key={ index } {...oferta} />
            </SwiperSlide>
          ))
        }
        </Swiper>
    </div>
  );
};

export default Ofertas;
