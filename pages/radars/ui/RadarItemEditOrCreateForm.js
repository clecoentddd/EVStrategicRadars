import React from 'react';
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
  typeOptions,
  categoryOptions,
  zoomInOptions,
  handleInputChange,
  handleSaveItem,
  setShowForm
}) => {
  const distanceOptions = [
    { value: 'Detected', label: 'Detected' },
    { value: 'Assessing', label: 'Assessing' },
    { value: 'Assessed', label: 'Assessed' },
    { value: 'Responding', label: 'Responding' },
    { value: 'Responded', label: 'Responded' }
  ];

  const impactOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' }
  ];

  const toleranceOptions = [
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
  ];

  return (
    <div className={styles.showForm}>
      {/* This container aligns the title and buttons */}
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>
          {editMode ? 'Edit Radar Item' : 'Create Radar Item'}
          {editMode && formData.name && `: ${formData.name}`}
        </h3>
        <div className={styles.headerButtons}>
          <button
            type="submit" // Can be type="button" if form submission is handled purely by JS
            onClick={(e) => { e.preventDefault(); handleSaveItem(); }} // Explicitly call handleSaveItem
            className={styles.saveButton}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSaveItem(); }}>
        <div className={styles.formRow}>
          <div className={`${styles.column} ${styles.flex2}`}>
            <label htmlFor="name" className={styles.label}>
              Name
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className={`${styles.inputField} ${styles.smallInput}`}
            />

            <label htmlFor="detect" className={`${styles.label} ${styles.marginTop}`}>
              What have you detected
            </label>
            <textarea
              name="detect"
              value={formData.detect}
              onChange={handleInputChange}
              required
              className={`${styles.textArea} ${styles.smallTextArea}`}
            />

            <label htmlFor="assess" className={`${styles.label} ${styles.marginTop}`}>
              What is your assessment
            </label>
            <textarea
              name="assess"
              value={formData.assess}
              onChange={handleInputChange}
              className={`${styles.textArea} ${styles.smallTextArea}`}
            />

            <label htmlFor="respond" className={`${styles.label} ${styles.marginTop}`}>
              What decisions could you take
            </label>
            <textarea
              name="respond"
              value={formData.respond}
              onChange={handleInputChange}
              className={`${styles.textArea} ${styles.smallTextArea}`}
            />
          </div>

          <div className={`${styles.column} ${styles.flex1}`}>
            {/* Type */}
            <div className={`${styles.optionGroup} ${styles.marginVertical}`}>
              <span className={styles.optionTitle}>Type</span>
              <div className={styles.radioGroup}>
                {typeOptions.map((option) => {
                  const isSelected = formData.type === option.label;
                  return (
                    <div
                      key={option.value}
                      className={`${styles.radioOption} ${isSelected ? styles.selected : ''}`}
                      onClick={() => handleInputChange({ target: { name: 'type', value: option.label } })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInputChange({ target: { name: 'type', value: option.label } }); } }}
                    >
                      {option.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category */}
            <div className={`${styles.optionGroup} ${styles.marginVertical}`}>
              <span className={styles.optionTitle}>Category</span>
              <div className={styles.radioGroup}>
                {categoryOptions.map((option) => {
                  const isSelected = formData.category === option.label;
                  return (
                    <div
                      key={option._id}
                      className={`${styles.radioOption} ${isSelected ? styles.selected : ''}`}
                      onClick={() => handleInputChange({ target: { name: 'category', value: option.label } })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInputChange({ target: { name: 'category', value: option.label } }); } }}
                    >
                      {option.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Distance */}
            <div className={`${styles.optionGroup} ${styles.marginVertical}`}>
              <span className={styles.optionTitle}>Distance</span>
              <div className={styles.radioGroup}>
                {distanceOptions.map((option) => {
                  const isSelected = formData.distance === option.value;
                  return (
                    <div
                      key={option.value}
                      className={`${styles.radioOption} ${styles.distanceOption} ${isSelected ? styles.selected : ''}`}
                      onClick={() => handleInputChange({ target: { name: 'distance', value: option.value } })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInputChange({ target: { name: 'distance', value: option.value } }); } }}
                    >
                      {option.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Impact */}
            <div className={`${styles.optionGroup} ${styles.marginVertical}`}>
              <span className={styles.optionTitle}>Impact</span>
              <div className={styles.radioGroup}>
                {impactOptions.map((option) => {
                  const isSelected = formData.impact === option.value;
                  return (
                    <div
                      key={option.value}
                      className={`${styles.radioOption} ${styles[`impact${option.value}`]} ${isSelected ? styles.selected : ''}`}
                      onClick={() => handleInputChange({ target: { name: 'impact', value: option.value } })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInputChange({ target: { name: 'impact', value: option.value } }); } }}
                    >
                      {option.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tolerance */}
            <div className={`${styles.optionGroup} ${styles.marginVertical}`}>
              <span className={styles.optionTitle}>Tolerance</span>
              <div className={styles.radioGroup}>
                {toleranceOptions.map((option) => {
                  const isSelected = formData.tolerance === option.value;
                  return (
                    <div
                      key={option.value}
                      className={`${styles.radioOption} ${styles[`tolerance${option.value}`]} ${isSelected ? styles.selected : ''}`}
                      onClick={() => handleInputChange({ target: { name: 'tolerance', value: option.value } })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInputChange({ target: { name: 'tolerance', value: option.value } }); } }}
                    >
                      {option.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Zoom In */}
            <div className={`${styles.optionGroup} ${styles.marginTop}`}>
              <label className={styles.optionTitle}>Zoom In</label>
              <select
                name="zoom_in"
                value={formData.zoom_in}
                onChange={handleInputChange}
                className={`${styles.inputField} ${styles.smallInput}`}
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
      </form>
    </div>
  );
};

export default RadarItemEditOrCreateForm;