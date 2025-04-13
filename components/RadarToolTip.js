import React from 'react';
import styles from './RadarToolTip.module.css'; // Adjust the path as necessary

const RadarTooltip = ({ tooltipData, onEditClick }) => {
  if (!tooltipData?.itemData) return null;

  const { itemData, xPos, yPos } = tooltipData;
  const { name, category, type, detect, impact, tolerance, distance, zoom_in } = itemData;

  return (
    <div 
      className={styles.tooltip}
      style={{ left: xPos, top: yPos - 140 }}
    >
      <div className={styles.row}>
        <span className={styles.label}>Title:</span>
        <span className={styles.value}>{name}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Category:</span>
        <span className={styles.value}>{category}</span>
      </div>
      {/* Add all other fields similarly */}
      <div className={styles.row}>
        <span className={styles.label}>Description:</span>
        <span className={styles.value}>{detect}</span>
      </div>

      {zoom_in ? (
        <div className={styles.row}>
          <span className={styles.label}>Zoom into radar:</span>
          <a href={`/radars/ui/${zoom_in.name}?radarId=${zoom_in.id}`} 
             target="_blank" 
             className={styles.link}>
            {zoom_in.name}
          </a>
        </div>
      ) : (
        <div className={`${styles.row} ${styles.mutedText}`}>Zoom In Not Selected</div>
      )}

      <button 
        className={styles.editButton} 
        onClick={() => onEditClick(itemData)}
      >
        Edit
      </button>
    </div>
  );
};

export default RadarTooltip;