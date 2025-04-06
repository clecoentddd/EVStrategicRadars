import React from 'react';
import styles from './radarItemEditOrCreateForm.module.css';

const RadarItemEditOrCreateForm = ({
  showForm,
  editMode,
  formData,
  typeOptions,
  categoryOptions,
  zoomInOptions,
  handleInputChange,
  handleSaveItem,
  setShowForm
}) => {
  return (
    <div className={styles.showForm}> 
      <h3>{editMode ? "Edit Radar Item" : "Create Radar Item"}</h3>
      <form onSubmit={(e) => { e.preventDefault(); handleSaveItem(); }}>
        <div className={styles.formRow}> 
          <div className={styles.column} style={{ flex: 2 }}> 
            <label htmlFor="name" className={styles.label}>
              Name
            </label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              required 
              className={styles.inputField} 
            />
            <label htmlFor="detect" className={styles.label}>
              What have you detected 
            </label>
            <textarea 
              name="detect" 
              value={formData.detect} 
              onChange={handleInputChange} 
              required 
              className={styles.textArea} 
            />
            <label htmlFor="assess" className={styles.label}>
              What is your assessment
            </label>
            <textarea 
              name="assess" 
              value={formData.assess} 
              onChange={handleInputChange} 
              className={styles.textArea} 
            />
            <label htmlFor="respond" className={styles.label}>
              What decisions could you take
            </label>
            <textarea 
              name="respond" 
              value={formData.respond} 
              onChange={handleInputChange} 
              className={styles.textArea} 
            />
          </div>
          <div className={styles.column} style={{ flex: 1 }}> 
            {/* Type Radio Buttons */}
            <div className={`${styles.optionGroup} ${styles.typeGroup}`}>
              <label className={styles.optionLabel}>
                <strong>Type</strong>
              </label>
              <div className={styles.radioGroup}>
                {typeOptions.map((option) => (
                  <label key={option.value} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="type"
                      value={option.label}
                      checked={formData.type === option.label}
                      onChange={handleInputChange}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioCustom}></span>
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Category Toggle Switches */}
            <div className={`${styles.optionGroup} ${styles.categoryGroup}`}>
              <label className={styles.optionLabel}>
                <strong>Category</strong>
              </label>
              <div className={styles.toggleGroup}>
                {categoryOptions.map((option) => (
                  <label key={option._id} className={styles.toggleLabel}>
                    <input
                      type="radio"
                      name="category"
                      value={option.label}
                      checked={formData.category === option.label}
                      onChange={handleInputChange}
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleSwitch}>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Distance Slider */}
            <div className={styles.sliderContainer} style={{ marginBottom: '24px' }}>
              <label htmlFor="distance" className={styles.sliderLabel}>
                <strong>Distance</strong>
              </label>
              <div className={styles.sliderWrapper}>
                <div className={styles.sliderTopLabels}>
                  <span>Detected</span>
                  <span>Assessed</span>
                  <span>Responded</span>
                </div>
                
                <input
                  type="range"
                  name="distance"
                  min="0"
                  max="4"
                  step="1"
                  value={
                    formData.distance 
                      ? ['Detected', 'Assessing', 'Assessed', 'Responding', 'Responded'].indexOf(formData.distance)
                      : 0
                  }
                  onChange={(e) => {
                    const distanceValues = ['Detected', 'Assessing', 'Assessed', 'Responding', 'Responded'];
                    handleInputChange({
                      target: {
                        name: 'distance',
                        value: distanceValues[parseInt(e.target.value)]
                      }
                    });
                  }}
                  className={`${styles.sliderInput} ${styles.distanceSlider}`}
                />
                
                <div className={styles.sliderBottomLabels}>
                  <span>Assessing</span>
                  <span>Responding</span>
                </div>
              </div>
            </div>

            {/* Impact Slider */}
            <div className={styles.sliderContainer}>
              <label htmlFor="impact" className={styles.sliderLabel}>
                <strong>Impact</strong>
              </label>
              <div className={styles.sliderWrapper}>
                <input
                  type="range"
                  name="impact"
                  min="0"
                  max="2"
                  step="1"
                  value={formData.impact ? ['Low', 'Medium', 'High'].indexOf(formData.impact) : 0}
                  onChange={(e) => {
                    const impactLabels = ['Low', 'Medium', 'High'];
                    handleInputChange({
                      target: {
                        name: 'impact',
                        value: impactLabels[parseInt(e.target.value)]
                      }
                    });
                  }}
                  className={`${styles.sliderInput} ${
                    formData.impact === 'High' ? styles.highImpact :
                    formData.impact === 'Medium' ? styles.mediumImpact : 
                    formData.impact === 'Low' ? styles.lowImpact : ''
                  }`}
                />
                <div className={styles.sliderLabels}>
                  <span className={formData.impact === 'Low' ? styles.lowLabel : ''}>Low</span>
                  <span className={formData.impact === 'Medium' ? styles.mediumLabel : ''}>Medium</span>
                  <span className={formData.impact === 'High' ? styles.highLabel : ''}>High</span>
                </div>
              </div>
            </div>

            {/* Tolerance Slider */}
            <div className={styles.sliderContainer}>
              <label htmlFor="tolerance" className={styles.sliderLabel}>
                <strong>Tolerance</strong>
              </label>
              <div className={styles.sliderWrapper}>
                <input
                  type="range"
                  name="tolerance"
                  min="0"
                  max="2"
                  step="1"
                  value={formData.tolerance ? ['High', 'Medium', 'Low'].indexOf(formData.tolerance) : 0}
                  onChange={(e) => {
                    const toleranceLabels = ['High', 'Medium', 'Low'];
                    handleInputChange({
                      target: {
                        name: 'tolerance',
                        value: toleranceLabels[parseInt(e.target.value)]
                      }
                    });
                  }}
                  className={`${styles.sliderInput} ${
                    formData.tolerance === 'High' ? styles.highTolerance :
                    formData.tolerance === 'Medium' ? styles.mediumTolerance : 
                    formData.tolerance === 'Low' ? styles.lowTolerance : ''
                  }`}
                />
                <div className={styles.sliderLabels}>
                  <span className={formData.tolerance === 'High' ? styles.highLabel : ''}>High</span>
                  <span className={formData.tolerance === 'Medium' ? styles.mediumLabel : ''}>Medium</span>
                  <span className={formData.tolerance === 'Low' ? styles.lowLabel : ''}>Low</span>
                </div>
              </div>
            </div>

            {/* Zoom In Select */}
            <div className={styles.zoomInGroup}>
              <label className={styles.zoomInLabel}>Zoom In</label>
              <div className={styles.inputWrapper}>
                <select
                  name="zoom_in"
                  value={formData.zoom_in}
                  onChange={handleInputChange}
                  className={styles.inputZoomInField}
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
        </div>
        <div className={styles.buttonGroup}>
          <button
            type="submit"
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
      </form>
    </div>
  );
};

export default RadarItemEditOrCreateForm;