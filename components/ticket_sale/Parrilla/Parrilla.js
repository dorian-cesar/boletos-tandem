import React from 'react'
import styles from './Parrilla.module.css'

const Parrilla = (props) => {
  const { isShowParrilla = false } = props;
  
  return (
    isShowParrilla &&
    <section className={ styles['grill-detail'] }>
      <div className={ styles['cross-container'] }>
        <img src="img/icon/buttons/close-circle-outline.svg" className={ styles['cross'] }/>
      </div>
    </section>
  )
}

export default Parrilla;