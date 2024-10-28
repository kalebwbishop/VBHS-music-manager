import React from "react";
import styles from "./Popup.module.css";

function Popup({ showPopup, popupContent, closePopup }) {
  return (
    <>
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            {popupContent}
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Popup;
