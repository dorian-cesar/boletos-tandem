import React, { useState } from 'react';
import styles from './Acordeon.module.css';

const Acordeon = (props) => {

  const { title, children } = props; 
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles['accordion']}>
      <div className={styles['accordion-header']} onClick={toggleAccordion}>
        <span>{title} {isOpen ? '▼' : '►'}</span>
      </div>
      {isOpen && 
        <div className={styles['accordion-content']}>
          { children }
        </div>
      }
    </div>
  );  
};

export default Acordeon;
