import axios from 'axios'
import Layout from 'components/Layout'
import { useState } from 'react'

import Head from 'next/head'
import Footer from '../components/Footer';




export default function Terminos(props) {
  const [stage, setStage] = useState(0);
  return (
    <Layout>
      <Head>
        <title>PullmanBus | Terminos de Uso</title>
      </Head>
      <div className="pullman-mas mb-5">
        <div className="container">
          <div className="row py-4">
            <div className="col-12">
              <span>Home &gt; Bases Legales </span>
            </div>
          </div>
          <div className="row pb-5">
            <div className="col-md-12 col-12 d-flex align-items-center bloque flex-column">

              <h1>Términos de uso</h1>
              <h3>I.- CONDICIONES GENERALES DE USO.</h3>
              <p>Pullman Bus, es una plataforma de venta de boletos de buses bajo la URL www.pullmanbus.cl. desarrollada y administrada por WIT Innovación y Tecnología SPA RUT 77.122.368-0, domiciliada en Los Conquistadores Providencia, Santiago, representada por Don Alejandro González domiciliado en la misma dirección, para nuestro cliente Pullman Bus representada por Don Luis Pedro Farias.</p>
              <p>Se considerará en el siguiente documento los siguientes términos: “Prestadoras de Servicios” a todas las empresas que ofrecen servicios de transporte, “Cliente” a toda persona que utilice el servicio de la plataforma y “Plataforma”, “Sitio Web” o “pullmanbus.cl” al portal web pullmanbus.cl.</p>
              <h3>II.- DE LAS CONDICIONES GENERALES DE USO.</h3>
              <p>La plataforma restringe las compras de pasajes solo a la disponibilidad de servicios y a los asientos disponibles entregados por las Prestadoras de Servicios y desplegados en pantalla por este sistema. El Cliente entiende y acepta que la información ofertada es proporcionada directa y exclusivamente por las Prestadoras de Servicios</p>
              <p>Estos términos y condiciones solo aplican para la compra de pasajes por Internet, es importante resaltar que la opción de reserva de pasajes no se encuentra habilitada por este medio, solo se hará efectiva la confirmación cuando sea validado el pago correspondiente por parte del Cliente.</p>
              <p>La venta de pasajes por Internet estará disponible para todas las personas naturales o jurídicas, chilenas o extranjeras para realizar los viajes contratados y que realicen sus compras con tarjetas de débito y/o crédito bancarias de entidades chilenas. Pullmanbus.cl no se hace responsable por el uso de tarjetas de crédito o débito hecha por terceros o por menores de edad.</p>
              <p>El Cliente aceptará y hará de su conocimiento que pullmanbus.cl no realiza ni presta el servicio de transporte de pasajeros, por lo que no le corresponderá ninguna responsabilidad por el servicio prestado ni por situaciones anómalas que pudieran presentarse durante el servicio adquirido como: retrasos en la hora de los servicios o desvíos no planificados, cambios en los puntos de embarque, cancelación o suspensión de servicios, extravíos o daños en el equipaje, accidentes de viajes, cambios de asientos o buses, permisos de viaje para menores edad sin sus padres, entre otros.</p>
              <p>Otros puntos a considerar:</p>
              <ul>
                <li>El cliente será responsable de mantener sus datos debidamente actualizados en el sistema.</li>
                <li>La contraseña del cliente es intransferible y es su responsabilidad la debida confidencialidad de esta.</li>
                <li>Empresas Pullman Bus no guarda registro de las tarjetas de crédito y/o débito porque los datos de éstas son encriptados por Transbank S.A. y es esta última la que certifica la transacción</li>
                <li>Pullman Bus en caso de necesidad, (incluyendo, pero no limitado acaso fortuito o fuerza mayor), podrá cancelar el servicio, sustituyéndolo por otro similar, operado por Pullman Bus u otra empresa de buses asociada.</li>
                <li>Las horas de viajes y de llegada a destino son referenciales, dependiendo de las condiciones de tránsito y climáticas. En caso de atraso en la llegada de un bus a un destino, respecto de la hora estimada inicialmente, La Empresa no asume las conexiones contratadas por un pasajero con un tercero.</li>
                <li>Pullman Bus se reserva la facultad, de que, si estima que un pasajero pudiese afectar la seguridad o transporte de los demás pasajeros, se negará a prestarle el servicio, debido a una conducta contraria al comportamiento razonable que debe mantener una persona abordo.</li>
                <li>Que la persona o cliente realice una infracción o delito que puedan poner en peligro o riesgo la seguridad del bus, de los demás pasajeros y de su tripulación, que altere la disciplina y buen orden abordo.</li>
                <li>Que la persona o cliente de muestras o signos evidentes de haber ingerido bebidas alcohólicas en exceso y/o alguna sustancia psicotrópica.</li>
                <li>Que incurra en el incumplimiento de cualquier Ley o regulación que aplique o que no acate cualquier requerimiento realizado por la autoridad gubernamental respectiva.</li>
              </ul>
              <h3>III.- DISPOSICIONES GENERALES.</h3>
              <p>La realización de actos de contravención a las presentes condiciones generales de uso, como, asimismo, de la normativa legal chilena aplicable al efecto, implicará la terminación inmediata de cualquier relación contractual entre el cliente y pullmanbus.cl, sin perjuicio de las responsabilidades civiles, penales y de otra índole que procedan, según sea el caso. pullmanbus.cl fija su domicilio fiscal en la ciudad de Santiago y se someten a la competencia de sus Tribunales, a efectos legales.</p>
              <h3>IV.- DE LOS MEDIOS DE PAGO Y SERVICIOS DE COMPRA.</h3>
              <p>El Cliente acepta ingresar datos personales correctos y válidos al momento de realizar la compra. Estos mismos datos serán utilizados en la emisión del pasaje, el cual debe incluir nombre completo y número de RUN o Pasaporte del usuario que viajará, pullmanbus.cl no se hace responsable por errores imputados al cliente al momento de ingresar datos en el procesamiento de la compra bien sea datos personales o bancarios. Será responsabilidad del Cliente demostrar la veracidad de sus datos en caso de ser requerido por alguna otra instancia. La operación de compra se hará efectiva mediante el pago aprobado del valor del pasaje adquirido por el Cliente, la que tendrá como efecto la reserva de los asientos disponibles que hayan sido seleccionados en dicha operación.</p>
              <p>Si el pago no se materializa, la operación será fallida y, en consecuencia, los asientos seleccionados quedarán disponibles para una nueva operación. Bajo ningún concepto se realizará reserva sin pago asociado. Una vez efectuado el pago, el pasaje será emitido de forma nominativa con todos los datos correspondientes y se enviará un aviso de confirmación a la dirección de correo electrónico registrada por el Cliente. En caso de ser necesario, deberá llamar o escribir a nuestros Canales de Atención para que sea enviado de forma directa. El comprobante enviado en la confirmación de compra indicará las instrucciones a seguir por el Cliente en cuanto a la impresión y presentación del boleto, para poder ocupar el servicio contratado. La disposición del pasaje al momento de la salida del bus en documento impreso será de entera responsabilidad de El Cliente y no podrá ser realizado en el terminal ni en ventanillas del operador de bus.</p>
              <p>Pullmanbus.cl no será responsable por la pérdida o robo del pasaje de confirmación ni será responsable en caso de que no pueda realizar el viaje por no contar con el boleto de compra. No está establecido en nuestras condiciones los cambios en la fecha u hora del viaje, datos personales, asientos, ni ninguna otra información que afecte la compra ya validada. En caso de un error o cambio, el Cliente deberá proceder a la devolución del pasaje con los respectivos tiempos para devolución y proceder a realizar una nueva compra.</p>
              <p>Pullmanbus.cl no podrá garantizar que los servicios de las Prestadoras de Servicios estén libres de errores o fallas en el funcionamiento, por lo tanto, no será responsable por caso de interrupciones o fallas por parte de las Prestadoras de Servicios, o en caso se situaciones fortuitas que ameriten la suspensión de las rutas, inundaciones, sismos o cierre de las vías. El uso, condiciones de crédito, intereses, entre otros, son de exclusiva responsabilidad de su banco emisor, y deben ser gestionadas con la entidad bancaria correspondiente.</p>
              <p>Pullmanbus.cl no guardará ningún tipo de registro de datos bancarios Los precios son definidos por las Prestadoras de Servicios y están sujetos a cambios sin previo aviso. El Cliente no podrá utilizar los servicios ofrecidos por pullmanbus.cl para uso comercial ni actividades con fines de lucro, sin expresa autorización. Asimismo, no podrá efectuar reservaciones de pasajes con el fin de obtener lucro mediante especulaciones de precios y se prohíbe la reventa al público de pasajes adquiridos mediante los servicios ofrecidos por nuestra plataforma.</p>
              <p>Pullmanbus.cl, procurará mantener, en la medida de lo posible, la continuidad de los servicios ofrecidos las 24 horas del día por los 365 días del año. Sin embargo, se hace presente la posibilidad de existencia de errores y/o fallos propios de un sistema informático que afecten dicha continuidad, frente a los cuales, El Cliente y/o usuario declara conocer y aceptar como posibles contingencias fortuitas, eximiendo a pullmanbus.cl de cualquier responsabilidad ulterior alrespecto. El Cliente será responsable de presentarse en el terminal o paradero de embarque correspondiente en el tiempo establecido por cada una de las Prestadoras de Servicios y solo podrá abordar el bus en el punto de embarque indicado al momento de hacer la compra y reflejado en el pasaje. Una vez confirmado el pasaje no podrá cambiarse el punto de embarque. Para rutas internacionales, en caso de ser negado el ingreso al país destino, lo cual es a completa responsabilidad del cliente, pullmanbus.cl no estará obligado a devolver los valores de los boletos.</p>
              <h3>V.- CONDICIONES DE ANULACIÓN DE COMPRAS POR INTERNET.</h3>
              <ul>
                <p>Pullman Bus confirmará la recepción mediante el envío de un correo electrónico. El cliente podrá llamar a nuestro Call Center 600 600 0018 para confirmar dicha recepción. Los plazos de reversa de las anulaciones solicitadas a través de nuestra página web se cursarán con un plazo de:</p>
                <li>5 días hábiles para las compras con tarjeta de débito. Pullman Bus realizará una transferencia electrónica a la cuenta corriente indicada por el cliente al momento de solicitar su anulación.</li>
                <li>5 días hábiles para las compras con tarjeta de crédito bancarias y de casas comerciales. Dicho cargo se reversará en el siguiente o subsiguiente estado de pago, según el banco o casa comercial emisora de la tarjeta.</li>
                <li>Para realizar el proceso de anulación, el cliente debe estar previamente registrado en el sitio www.pullmanbus.cl, iniciar su sesión, e ir al Menú en opción “Anulaciones”, donde deberá ingresar el número de orden.</li>
                <li>La anulación puede ser por uno o el total de los boletos comprados en la transacción.</li>
                <li>La anulación debe ser realizada por lo menos 4 horas antes de la salida del servicio del boleto que se desea anular.</li>
                <li>El monto de la devolución será del 85% del valor del pasaje. Según lo señalado en el artículo 67 del decreto Supremo 212 del Ministerio de Transportes.</li>
              </ul>
              <h3>VI.- CONDICIONES COMERCIALES Y RESTRICCIONES.</h3>
              <ul>
                <li>Estas condiciones y restricciones sólo aplican para la compra de pasajes por Internet. La opción de reserva de pasajes no se encuentra habilitada por este medio.</li>
                <li>La venta de pasajes por Internet estará disponible para todas las personas que posean tarjetas de crédito bancarias y de casas comerciales en convenio con Pullman Bus.</li>
                <li>El sistema de Venta de Pasajes por Internet limita las compras de pasajes solo a la disponibilidad de servicios y a los asientos disponibles desplegados en pantalla por este sistema, al momento de realizar y confirmar la compra.</li>
                <li>La compra de Pasajes por Internet aceptará como medio de pago las tarjetas de crédito bancarias emitidas en Chile y se realizará a través del servicio WEB PAY de Transbank S.A. que incorpora elementos de seguridad provistos por Transbank S.A. Se limita la cantidad de compras diarias con tarjetas de crédito bancarias y/o de casas comerciales por razones de seguridad para nuestros clientes.</li>
                <li>Las tarjetas de crédito emitidas en Chile serán cargadas en pesos conforme a lo determinado por Transbank S.A.</li>
                <li>El uso, condiciones de crédito, intereses y otras condiciones de las tarjetas de crédito bancarias aplicables son de exclusiva responsabilidad de su emisor y no de Pullman Bus.</li>
                <li>Las compras de pasajes mediante tarjetas de crédito bancarias y de casas comerciales podrán ser anuladas parcial o totalmente siempre que cumplan con las condiciones que más adelante se detallan.</li>
                <li>El o los boletos electrónicos serán enviados vía E-Mail a la dirección de correo electrónico ingresada por el cliente al momento de registrarse para efectuar compras por internet.</li>
                <li>Las compras de pasajes en www.pullmanbus.cl son válidas para la fecha y hora del servicio seleccionado por el cliente al momento de efectuar la compra, por lo tanto, no se realizarán canjes o cambios para las compras realizadas vía internet.</li>
              </ul>
              <h3>VII.- BENEFICIOS.</h3>
              <p>Los clientes socios de Pullman Pass obtendrán como beneficio la acumulación de un 10% del valor de la compra en puntos, los que se harán efectivos luego de realizado el servicio. Estos puntos podrán ser utilizados para canjear pasajes. Nota: Los beneficios o descuentos se podrán modificar o dejar sin efecto unilateralmente por la empresa, sin previo aviso. Los beneficios no son acumulables con otras promociones o convenios.</p>
              <p>Una conducta contraria al comportamiento razonable que debe mantener una persona abordo.</p>
              <ul>
                <li>Que la persona o cliente realice una infracción o delito que puedan poner en peligro o riesgo la seguridad del bus, de los demás pasajeros y de su tripulación, que altere la disciplina y buen orden abordo.</li>
                <li>Que la persona o cliente de muestras o signos evidentes de haber ingerido bebidas alcohólicas en exceso y/o alguna sustancia psicotrópica.</li>
                <li>Que incurra en el incumplimiento de cualquier Ley o regulación que aplique o que no acate cualquier requerimiento realizado por la autoridad gubernamental respectiva.</li>
              </ul>
              <h3>VIII.- CONDICIONES DEL EQUIPAJE: Artículo 68 decreto supremo 212.</h3>
              <p>En los servicios rurales e interurbanos, cada pasajero tendrá derecho a llevar, libre de pago, hasta treinta kilos de equipaje, siempre que su volumen no exceda de 180 decímetros cúbicos.</p>
              <h3>IX.- LÍMITES DE RESPONSABILIDAD: Artículo 70 Decreto Supremo 212 MTT.</h3>
              <p>El transporte de valijas, bultos y paquetes será de responsabilidad de las empresas cuando se lleven en la parrilla o en las cámaras portaequipajes, las que deberán entregar al pasajero un comprobante por cada bulto. Ello ocurrirá en todo caso respecto al transporte de cartas y encomiendas en cuanto se haga conforme a la ley. Las especies primeramente citadas serán de cuidado de los pasajeros cuando se lleven en las parrillas portaequipajes interiores.</p>
              <p>Cuando un pasajero lo desee podrá hacer declaración escrita a la empresa de las especies que transporte o remita. Esto será obligatorio cuando, a juicio del pasajero o remitente, el valor de los objetos exceda de 5 Unidades Tributarias Mensuales. Al efecto, las empresas pondrán a disposición del público en sus terminales los formularios adecuados para hacer la declaración y podrán verificar la autenticidad de ellas.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  )
}
