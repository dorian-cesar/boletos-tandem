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
        <div style={{ position: "relative", height: "600px" }}>
          <Swiper
            spaceBetween={30}
            centeredSlides={true}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation={true}
            allowTouchMove={false}
            modules={[Autoplay, Pagination, Navigation]}
            className="img-principal"
            style={{ height: "100%" }}
          >
            {images.length < 1 ? (
              <div style={{ height: "600px" }}></div>
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
                          style={{ height: "600px", objectFit: "contain" }}
                        />
                      </a>
                    </Link>
                  ) : (
                    <img
                      className="w-100"
                      src={image}
                      alt={`Banner ${index}`}
                      style={{
                        height: "600px",
                        objectFit: "contain",
                        cursor: "default",
                      }}
                    />
                  )}
                </SwiperSlide>
              ))
            )}
          </Swiper>
          <div
            className="buscador-banner"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, 100%)",
              zIndex: 10,
              width: "90%",
              pointerEvents: "auto",
            }}
          >
            <DynamicBusquedaServicioComponent origenes={origenes} dias={dias} />
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
};

export default Banner;
