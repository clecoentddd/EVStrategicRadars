import React, { useState } from 'react';
import styles from './LoadingButton.module.css'; // Import the CSS module

const LoadingButton = ({ onClick, isLoading, children }) => {
  return (
    <button className={styles.button} onClick={onClick} disabled={isLoading}>
      {isLoading ? (
        <div className={styles.spinner}></div> // Render spinner if loading
      ) : (
        children // Render button text if not loading
      )}
    </button>
  );
};

export default LoadingButton;
