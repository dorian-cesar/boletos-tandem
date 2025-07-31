import Layout from "components/Layout";
import { useState } from "react";

import Head from "next/head";

export default function Politica(props) {
  const [stage, setStage] = useState(0);
  return (
    <Layout>
      <Head>
        <title>Tandem | Política de Calidad</title>
      </Head>
      <div className="pullman-mas mb-5">
        <div className="container">
          <div className="row py-4">
            <div className="col-12">
              <span>Home &gt; Política de Calidad </span>
            </div>
          </div>
          <div className="row pb-5">
            <div className="col-md-12 col-12 d-flex align-items-center bloque flex-column">
              <h1>
                Política Integrada de Calidad, Seguridad, Salud Ocupacional,
                Medio Ambiente y Seguridad Vial
              </h1>

              <p>
                En <strong>TANDEM S.A.</strong>, nos comprometemos a ofrecer un
                servicio de transporte terrestre industrial de pasajeros seguro,
                confiable, eficiente y ambientalmente responsable, guiado por
                nuestro Sistema de Gestión Integrado de Calidad, Seguridad y
                Salud Ocupacional, Medio Ambiente y Seguridad Vial.
              </p>

              <p>
                Asumimos la responsabilidad de satisfacer las expectativas de
                nuestros clientes, trabajadores, propietarios, proveedores,
                autoridades y comunidad, asegurando una experiencia de servicio
                sobresaliente y orientando nuestros esfuerzos a la mejora
                continua de nuestros procesos.
              </p>

              <p>
                <strong>Nuestros compromisos fundamentales son:</strong>
              </p>

              <ul>
                <li>
                  <strong>Seguridad y salud como prioridad</strong>, promoviendo
                  un entorno de trabajo seguro para nuestros trabajadores y
                  usuarios. Implementamos medidas efectivas de control de
                  riesgos con el objetivo firme y explícito de alcanzar una
                  accidentabilidad cero, previniendo lesiones, enfermedades
                  laborales y accidentes de tránsito.
                </li>
                <li>
                  <strong>Enfoque en el pasajero y su experiencia</strong>,
                  asegurando altos estándares de calidad en cada viaje, mediante
                  una atención proactiva, el uso de tecnología avanzada, y una
                  flota moderna, cómoda y adecuada a las necesidades del
                  servicio.
                </li>
                <li>
                  <strong>
                    Protección del medio ambiente y acción frente al cambio
                    climático
                  </strong>
                  , mediante el uso eficiente de los recursos, la prevención de
                  la contaminación y la evaluación constante de los impactos
                  ambientales. Integramos el cambio climático en nuestra
                  planificación y proyectamos una transición progresiva hacia la
                  electromovilidad en nuestra flota, reduciendo así nuestro
                  impacto al medio ambiente.
                </li>
                <li>
                  <strong>Gestión eficiente de contratos y operaciones</strong>,
                  garantizando servicios oportunos y flexibles, con
                  infraestructura y soporte técnico adecuados, asegurando la
                  continuidad operativa incluso ante condiciones adversas o de
                  emergencias.
                </li>
                <li>
                  <strong>Mejora continua y cumplimiento normativo</strong>,
                  fortaleciendo nuestras competencias, procesos y sistemas para
                  alcanzar niveles crecientes de desempeño en calidad,
                  seguridad, salud, medio ambiente y seguridad vial.
                </li>
              </ul>

              <p>
                En <strong>TANDEM S.A.</strong>, trabajamos con convicción para
                ofrecer un servicio de excelencia, con responsabilidad social,
                conciencia ambiental y un compromiso real con la vida y la
                seguridad de todas las personas que transportamos.
              </p>

              <p>
                <strong>Enrique Araneda González</strong>
                <br />
                Gerente División Industrial
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
