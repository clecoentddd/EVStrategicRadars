// RadarItemEditOrCreateForm.js
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './radarItemEditOrCreateForm.module.css';

export const DEFAULT_FORM_VALUES = {
  name: '',
  detect: '',
  assess: '',
  respond: '',
  category: '',
  type: '',
  distance: 'Detected',
  impact: 'Low',
  tolerance: 'High',
  zoom_in: '',
};

const RadarItemEditOrCreateForm = ({
  showForm,
  editMode,
  formData = DEFAULT_FORM_VALUES,
  typeOptions = [],
  categoryOptions = [],
  zoomInOptions = [],
  handleInputChange,
  handleSaveItem,
  setShowForm
}) => {
  // don't render anything if not visible
  if (!showForm) return null;

  // prevent background scrolling while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const content = (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} role="dialog" aria-modal="true">
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3 className={styles.formTitle}>
            {editMode ? 'Edit Radar Item' : 'Create Radar Item'}
            {editMode && formData.name ? `: ${formData.name}` : ''}
          </h3>
          <button
            onClick={() => setShowForm(false)}
            className={styles.closeButton}
            aria-label="Close"
            type="button"
          >
            ✖
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSaveItem(); }}
          className={styles.modalBody}
        >
          <div className={styles.formRow}>
            {/* Left column */}
            <div className={`${styles.column} ${styles.flex2}`}>
              <label className={styles.label}>Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={styles.inputField}
              />

              <label className={styles.label}>What have you detected?</label>
              <textarea
                name="detect"
                value={formData.detect}
                onChange={handleInputChange}
                required
                className={styles.textArea}
              />

              <label className={styles.label}>What is your assessment?</label>
              <textarea
                name="assess"
                value={formData.assess}
                onChange={handleInputChange}
                className={styles.textArea}
              />

              <label className={styles.label}>What decisions could you take?</label>
              <textarea
                name="respond"
                value={formData.respond}
                onChange={handleInputChange}
                className={styles.textArea}
              />
            </div>

            {/* Right column */}
            <div className={`${styles.column} ${styles.flex1}`}>
              {/* Type */}
              <div className={styles.optionGroup}>
                <span className={styles.optionTitle}>Type</span>
                <div className={styles.radioGroup}>
                  {typeOptions.map((option) => (
                    <div
                      key={option.value ?? option.label}
                      className={`${styles.radioOption} ${formData.type === option.label ? styles.selected : ''}`}
                      onClick={() => handleInputChange({ target: { name: 'type', value: option.label } })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInputChange({ target: { name: 'type', value: option.label } }); } }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className={styles.optionGroup}>
                <span className={styles.optionTitle}>Category</span>
                <div className={styles.radioGroup}>
                  {categoryOptions.map((option) => (
                    <div
                      key={option._id ?? option.id ?? option.label}
                      className={`${styles.radioOption} ${formData.category === option.label ? styles.selected : ''}`}
                      onClick={() => handleInputChange({ target: { name: 'category', value: option.label } })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInputChange({ target: { name: 'category', value: option.label } }); } }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Distance */}
              <div className={styles.optionGroup}>
                <span className={styles.optionTitle}>Distance</span>
                <div className={styles.radioGroup}>
                  {['Detected','Assessing','Assessed','Responding','Responded'].map(v => (
                    <div
                      key={v}
                      className={`${styles.radioOption} ${formData.distance === v ? styles.selected : ''}`}
                      onClick={() => handleInputChange({ target: { name: 'distance', value: v } })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInputChange({ target: { name: 'distance', value: v } }); } }}
                    >
                      {v}
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact */}
              <div className={styles.optionGroup}>
                <span className={styles.optionTitle}>Impact</span>
                <div className={styles.radioGroup}>
                  {['Low','Medium','High'].map(v => (
                    <div
                      key={v}
                      className={`${styles.radioOption} ${styles['impact' + v]} ${formData.impact === v ? styles.selected : ''}`}
                      onClick={() => handleInputChange({ target: { name: 'impact', value: v } })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInputChange({ target: { name: 'impact', value: v } }); } }}
                    >
                      {v}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tolerance */}
              <div className={styles.optionGroup}>
                <span className={styles.optionTitle}>Tolerance</span>
                <div className={styles.radioGroup}>
                  {['High','Medium','Low'].map(v => (
                    <div
                      key={v}
                      className={`${styles.radioOption} ${styles['tolerance' + v]} ${formData.tolerance === v ? styles.selected : ''}`}
                      onClick={() => handleInputChange({ target: { name: 'tolerance', value: v } })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInputChange({ target: { name: 'tolerance', value: v } }); } }}
                    >
                      {v}
                    </div>
                  ))}
                </div>
              </div>

              {/* Zoom In */}
              <div className={styles.optionGroup}>
                <label className={styles.optionTitle}>Zoom In</label>
                <select
                  name="zoom_in"
                  value={formData.zoom_in}
                  onChange={handleInputChange}
                  className={styles.inputField}
                >
                  <option value="">Select a "zoom-in" radar</option>
                  {zoomInOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className={styles.saveButton}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );

  // render portal into document.body so modal isn't affected by parent containers
  return ReactDOM.createPortal(content, document.body);
};

export default RadarItemEditOrCreateForm;
