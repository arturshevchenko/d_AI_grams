import React from 'react';
import styles from './Loader.module.css';

const Loader = ({ text = "Generating diagrams...", inline = true }) => {
  return (
    <div className={inline ? styles.inlineContainer : styles.loaderContainer}>
      <div className={styles.spinner}>
        <div className={styles.spinnerRing}></div>
      </div>
      {text && <div className={styles.loadingText}>{text}</div>}
    </div>
  );
};

export default Loader;