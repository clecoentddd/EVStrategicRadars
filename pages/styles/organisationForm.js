import React, { useState } from 'react';
import styles from './index.module.css';

const ConfigurationForm = ({ mode, config = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: config.name || '',
    level: config.level || '',
    purpose: config.purpose || '',
    context: config.context || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'level' ? parseInt(value) || '' : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={mode === 'create' ? styles.createFormContainer : styles.updateFormContainer}>
      <h2>{mode === 'create' ? 'Create an organisation' : 'Update Configuration'}</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Name</label>
          <br />
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="level">Level</label>
          <br />
          <input
            type="number"
            id="level"
            name="level"
            min="0"
            required
            style={{ width: '50px' }}
            value={formData.level}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="purpose">What is your purpose? Why do you get up in the morning?</label>
          <br />
          <textarea
            id="purpose"
            name="purpose"
            required
            rows="5"
            className={styles.purposeTextarea}
            value={formData.purpose}
            onChange={handleChange}
          ></textarea>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="context">What is your context? Could you describe what activities you cover?</label>
          <br />
          <textarea
            id="context"
            name="context"
            required
            rows="5"
            className={styles.purposeTextarea}
            value={formData.context}
            onChange={handleChange}
          ></textarea>
        </div>
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.button}>
            Save
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigurationForm;