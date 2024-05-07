import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Link from 'next/link';

const Banner = ( props ) => {

    const [images, setImages] = useState([{
        key: 'banner_01',
        url: '/',
        image: 'https://pullman.cl/imagenes/fenix/banner/banner-1.jpg'
    }]);

    async function getBannerImages() {
        try {
            const response = await fetch('/api/banner');
            const { object } = await response.json();
            return object;
        } catch (error) {
            return [];
        }
    }

    async function transformImages() {
        const images = await getBannerImages();
        const bannerImages = [];
        images.map(({ llave, link, imagen }) => bannerImages.push({
            key: llave,
            url: link ? link : '/',
            image: imagen
        }));
        return bannerImages;
    }

    useEffect(() => {
        transformImages().then(images => {
            setImages(images);
        });
    }, [])

    return (
        <Swiper 
            spaceBetween={ 30 }
            centeredSlides={ true }
            loop={ true }
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation={ true }
            allowTouchMove={ false }
            modules={[ Autoplay, Pagination, Navigation ]}
            className='img-principal'>
            {
                images.map(({ url, image }, index) => (
                    <SwiperSlide className="swiper-slide" key={index}>
                        <Link href={ url } legacyBehavior>
                            <a href='#' target='_blank'>
                                <img className='w-100' src={image} />
                            </a>
                        </Link>
                    </SwiperSlide>
                ))
            }
        </Swiper>
    )
}

export default Banner;