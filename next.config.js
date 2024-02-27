/** @type {import('next').NextConfig} */
module.exports = {
  async rewrites() {
    return [
      {
        source: '/Devolucion',
        destination: '/devolucion/Devolucion',
      },
      {
        source: '/Cuponera',
        destination: '/cuponera/Cuponera',
      },
      {
        source: '/CambioBoleto',
        destination: '/ticket-change/CambioBoleto',
      },
      {
        source: '/ConfirmacionBoleto',
        destination: '/ticket-confirmation/ConfirmacionBoleto',
      },
      {
        source: '/TeAyudamos',
        destination: '/te-ayudamos/TeAyudamos',
      },
    ];
  },
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  env: {
    PROJECT_DIRNAME: __dirname,
    site_url: "http://localhost:3000",
   
  },
  publicRuntimeConfig: {
    site_url: "http://localhost:3000",
  },
  serverRuntimeConfig: {
    site_url: "http://localhost:3000",
    service_url: process.env.NODE_ENV == "production"?"http://staging.pullman.cl/integracion-comercio-web/rest":"http://staging.pullman.cl/integracion-comercio-web/rest",
    service_password: process.env.NODE_ENV == "production"?"":"INT0000002",
    clave: process.env.NODE_ENV == "production"?"":"xWL!96JRaWi2lT0jG"
  },
}
