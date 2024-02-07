import React, { FunctionComponent } from 'react'
import { Props } from 'react-select';
import styles from './Acordeon.module.css';

const Acordeon: FunctionComponent<Props> = ({}) => {
  return (
    <div className={styles.acordeon}>
      <div className={styles.acordeonHeader}>
        <h3>Titulo</h3>
      </div>
      <div className={styles.acordeonBody}>
        <p>Contenido</p>
      </div>
    </div>
  )
}

export default Acordeon;