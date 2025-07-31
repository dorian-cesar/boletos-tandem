import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const imagenDeRespaldo = {
  key: "banner_01",
  // url: "/",
  // image: "https://pullman.cl/imagenes/fenix/banner/banner-1.jpg",
  image: "./banner-tandem.webp",
};

const DynamicBusquedaServicioComponent = dynamic(
  () => import("components/BusquedaServicio/BusquedaServicio"),
  {
    ssr: false,
  }
);

// const Banner = (props) => {
const Banner = ({ origenes, dias }) => {
  const [images, setImages] = useState([]);

  async function getBannerImages() {
    try {
      const response = await fetch("/api/banner");
      const { object } = await response.json();
      return object;
    } catch (error) {
      return [];
    }
  }

  async function transformImages() {
    // const images = await getBannerImages();
    const images = [];

    let bannerImages = [];
    images.map(({ llave, link, imagen, posicion }) =>
      bannerImages.push({
        key: llave,
        url: link ? link : "/",
        image: imagen,
        posicion,
      })
    );

    if (images.length < 1) {
      bannerImages.push(imagenDeRespaldo);
    }

    bannerImages = bannerImages.sort((a, b) => a.posicion - b.posicion);

    return bannerImages;
  }

  useEffect(() => {
    transformImages().then((images) => {
      setImages(images);
    });
  }, []);

  return (
    <>
      {images.length > 0 ? (
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          // loop={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          allowTouchMove={false}
          modules={[Autoplay, Pagination, Navigation]}
          className="img-principal"
        >
          {images.length < 1 ? (
            <div style={{ height: "500px" }}></div>
          ) : (
            images.map(({ url, image }, index) => (
              <SwiperSlide className="swiper-slide" key={index}>
                {url ? (
                  <Link href={url} legacyBehavior>
                    <a target={url.startsWith("/") ? "_self" : "_blank"}>
                      <img
                        className="w-100"
                        src={image}
                        alt={`Banner ${index}`}
                      />
                    </a>
                  </Link>
                ) : (
                  // <img className="w-100" style={{ cursor: 'default' }} src={image} alt={`Banner ${index}`} />
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "600px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Imagen del banner */}
                    <img
                      src={image}
                      alt={`Banner ${index}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        cursor: "default",
                      }}
                    />

                    {/* Buscador centrado */}
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 2,
                      }}
                    >
                      <DynamicBusquedaServicioComponent
                        origenes={origenes}
                        dias={dias}
                      />
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))
          )}
        </Swiper>
      ) : (
        <div></div>
      )}
    </>
  );
};

export default Banner;
