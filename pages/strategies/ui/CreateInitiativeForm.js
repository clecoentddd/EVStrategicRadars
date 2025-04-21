import React from 'react';
import styles from './CreateInitiativeForm.module.css';

const CreateInitiativeForm = ({ 
  targetStrategy,
  newElement = { name: '', description: '', status: 'Created' },
  handleCreateInitiative,
  handleCreateInitiativeChange,
  handleCancelCreateInitiative
}) => {
  // Debug log - remove after fixing
  console.log('Rendering CreateInitiativeForm with:', {
    targetStrategy,
    hasName: !!targetStrategy?.name,
    newElement
  });

  return (
    <form 
      className={styles.createInitiativeFormStyle} 
      onSubmit={(e) => {
        e.preventDefault();
        handleCreateInitiative(e);
      }}
    >
      {/* Debug header - shows if name is missing */}
      <h3>
        {targetStrategy?.name 
          ? `For Strategy ${targetStrategy.name}: add a new Initiative that is value creation driven:`
          : 'Add a new Initiative to selected strategy (DEBUG: name missing)'}
      </h3>
      
      {/* Name Input */}
      <input
        type="text"
        name="name"
        value={newElement.name || ''}
        onChange={handleCreateInitiativeChange}
        placeholder="Name"
        className={styles.initiativeInput}
        required
      />

      {/* Description Textarea */}
      <textarea
        name="description"
        value={newElement.description || ''}
        onChange={(e) => handleCreateInitiativeChange(e)}
        placeholder="Description"
        className={styles.initiativeTextarea}
        rows={3}
        minLength={20}
        required
      />

      {/* Status Selector */}
      <select
        name="status"
        value={newElement.status || 'Created'}
        onChange={(e) => handleCreateInitiativeChange(e)}
        className={styles.statusSelect}
      >
        <option value="Created">Created</option>
        <option value="In progress">In Progress</option>
        <option value="Closed">Closed</option>
      </select>

      {/* Buttons */}
      <div className={styles.buttonContainerStyle}>
        <button type="submit" className={styles.saveButton}>
          Create
        </button>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={() => handleCancelCreateInitiative()}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CreateInitiativeForm;