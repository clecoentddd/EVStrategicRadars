import React, { useState } from 'react';
import styles from './organisationForm.module.css'; // New CSS module

const OrganisationForm = ({ mode, config = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: config.name || '',
    level: config.level !== undefined ? config.level : '',
    purpose: config.purpose || '',
    context: config.context || ''
  });

  const handleChange = (e) => {
       const { name, value } = e.target;
       let updatedValue;
      if (name === 'level') {
         const parsedValue = parseInt(value);
         updatedValue = isNaN(parsedValue) ? '' : parsedValue;
        } else {
         updatedValue = value;
        }
        setFormData(prev => ({
         ...prev,
        [name]: updatedValue
     }));
     if (name === 'level') {
     console.log('Level input changed to:', updatedValue);
     }
    };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submissionData = {
      ...formData,
      level: formData.level === '' ? 0 : formData.level
    };
    onSubmit(submissionData);
  };

  return (
    <>
      <h2 className={styles.formTitle}>{mode === 'create' ? 'Create an Organisation' : 'Update this Organisation'}</h2>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className={styles.inputField}
          />
        </div>
        <div className={styles.formGroup}>
        <label htmlFor="level">Level</label>
        <input
          type="number"
          id="level"
          name="level"
          min="0"
          required
          value={formData.level}
          onChange={handleChange}
          className={styles.levelField}
        />
      </div>

        <div className={styles.formGroup}>
          <label htmlFor="purpose">
            What is your purpose (Why)? Your Vision (What)? Your Mission (Where & How)?
          </label>
          <textarea
            id="purpose"
            name="purpose"
            required
            rows="5"
            value={formData.purpose}
            onChange={handleChange}
            className={styles.textarea}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="context">
            What is your context? Could you describe what activities you cover?
          </label>
          <textarea
            id="context"
            name="context"
            required
            rows="5"
            value={formData.context}
            onChange={handleChange}
            className={styles.textarea}
          />
        </div>
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.button}>
            Save
          </button>
          <button type="button" className={styles.button} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
};

export default OrganisationForm;
