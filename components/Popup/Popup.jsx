import React from 'react';
import styles from "./Popup.module.css"
import ModalEntities from "../../entities/ModalEntities";



const Popup = ({ key, onClose }) => {

  const popInfo = {
    [ModalEntities.annulation_purse]: {
      title: 'probando'
    }
  }

  return (
    <div className={styles["popup-overlay"]}>
      <div className={styles["popup-container"]}>  
        <div className={styles["popup-header"]}>
          <img src="/img/icon/popup/warning-outline.svg"></img>
        </div>
        <div className={styles["popup-title"]}>
          {popInfo[key]?.title || 'aaaaa'}
        </div>
      </div>
    </div>
  );
};

export default Popup;
