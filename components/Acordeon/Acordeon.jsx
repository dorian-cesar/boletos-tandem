import React, { useEffect, useRef, useState } from 'react';
import styles from './Acordeon.module.css';

const Acordeon = (props) => {

  const { title, viaje, fecha, hora, children, open = false, textoPreguntasFrecuentes = '' } = props; 
  const [isOpen, setIsOpen] = useState(open);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles['accordion']}>
      <div className={`${ styles['accordion-header'] } ${ isOpen && styles['accordion-open'] }`} onClick={toggleAccordion}>
        { title && <span>{title}</span> }
        { !title && 
        <>
          <div className={ styles['travel-info'] }>
            <div className={ styles['travel-info-item'] }>
              <img src='img/icon/general/location-outline.svg'/>
              <span>{viaje}</span>
            </div>
            <div className={ styles['travel-info-item'] }>
              <img src='img/icon/general/calendar-clear-outline.svg'/>
              <span>{fecha}</span>
            </div>
            <div className={ styles['travel-info-item'] }>
              <img src='img/icon/general/time-outline.svg'/>
              <span>{hora}</span>
            </div>
          </div>
        </>
        }
        <div>
          <img 
            src='/img/icon/general/chevron-down-circle-outline.svg' 
            className={ isOpen ? styles['accordion-header-open'] : styles['accordion-header-close']} />
        </div>
      </div>
      {isOpen && 
        children ? (
          <div className={ `${ styles['accordion-content'] } ${ isOpen && styles['accordion-content-open'] }`} hidden={!isOpen}>
            { children }
          </div>
        ) : (
          <div className={ `${ styles['accordion-content'] } ${ isOpen && styles['accordion-content-open'] }`} hidden={!isOpen}>
            <div dangerouslySetInnerHTML={{ __html: textoPreguntasFrecuentes }} className={ `${ isOpen ? 'd-block' : 'd-none'}`}></div>
          </div>
        )
      }
    </div>
  );  
};

export default Acordeon;
