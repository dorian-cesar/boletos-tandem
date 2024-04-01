import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const Banner = ( props ) => {
    const images = [
        'https://pullman.cl/imagenes/fenix/banner/banner-1.png',
        'https://pullman.cl/imagenes/fenix/banner/banner-2.png'
    ]

    return (
        <Swiper 
            spaceBetween={ 30 }
            centeredSlides={ true }
            loop={ true }
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation={ true }
            modules={[ Autoplay, Pagination, Navigation ]}
            className='img-principal'>
            {
                images.map((image, index) => (
                    <SwiperSlide className="swiper-slide" key={index}>
                        <img className='w-100' src={image} />
                    </SwiperSlide>
                ))
            }
        </Swiper>
    )
}

export default Banner;