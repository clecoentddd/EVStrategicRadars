import React, { useState } from 'react';
import styles from './slidePanel.module.css';
import OrganisationForm from './organisationForm';
import AICoachForm from './AICoachForm';

// to edit description and contexte, delete,  etc
const SlidePanel = ({
  activeConfig,
  onClose,
  aiCoach,
  isUpdateFormVisible,
  configToUpdate,
  onToggleForm,
  onUpdateSubmit,
  onDelete,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!activeConfig) return null;

  return (
    <div className={styles.panelOverlay}>
      <div className={styles.panelContent}>
        {/* Header */}
        <div className={styles.panelHeader}>
          <h2>{activeConfig.name}</h2>
          <button onClick={onClose} className={styles.closeButton}>✖</button>
        </div>

        {/* EDIT FORM OR READ-ONLY */}
        {isUpdateFormVisible && configToUpdate ? (
          <OrganisationForm
            mode="update"
            config={configToUpdate}
            onSubmit={onUpdateSubmit}
            onCancel={() => onToggleForm(null)}
          />
        ) : (
          <>
            {/* Read-only sections */}
            <div className={styles.section}>
              <h4>Purpose</h4>
              <p>{activeConfig.purpose}</p>
            </div>
            <div className={styles.section}>
              <h4>Context</h4>
              <p>{activeConfig.context}</p>
            </div>

            {/* Panel actions */}
            <div className={styles.panelActions}>
              <button
                className={`${styles.panelButton} ${styles.aiCoachButton}`}
                onClick={() => aiCoach.toggleAICoach(activeConfig.id)}
              >
                AI Coach
              </button>

              <button
                className={styles.editButton}
                onClick={() => onToggleForm('update', activeConfig)}
              >
                Edit Organization
              </button>

              <button
                className={styles.deleteButton}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Organization
              </button>
            </div>

            {/* AI Coach embedded */}
            {aiCoach.aiCoachVisible[activeConfig.id] && (
              <div className={styles.aiCoachContainer}>
                <AICoachForm config={activeConfig} aiCoach={aiCoach} />
              </div>
            )}
          </>
        )}
      </div>

      {/* === Delete Confirmation Modal === */}
      {showDeleteConfirm && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmModal}>
            <p>Are you sure you want to delete "{activeConfig.name}"?</p>
            <div className={styles.confirmButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmButton}
                onClick={() => {
                  onDelete(activeConfig.id);
                  setShowDeleteConfirm(false);
                  onClose();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlidePanel;
