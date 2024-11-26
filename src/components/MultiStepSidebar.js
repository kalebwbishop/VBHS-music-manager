import React from "react";
import styles from "./MultiStepSidebar.module.css";

function MultiStepSidebar({ title, sidebarContent, showSidebar, closeSidebar }) {
    return (
        <div
            className={`${styles.sidebar} ${showSidebar ? styles.show : ""}`}
        >
            <div className={styles.header}>
                <h2>{title}</h2>
                <button className={styles.closeButton} onClick={closeSidebar}>
                    ×
                </button>
            </div>
            <div className={styles.sidebarContent}>{sidebarContent}</div>
        </div>
    );
}

export default MultiStepSidebar;
