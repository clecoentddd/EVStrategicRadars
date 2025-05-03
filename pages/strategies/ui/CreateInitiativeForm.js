import React from 'react';
import styles from './CreateInitiativeForm.module.css';

const CreateInitiativeForm = ({ 
  targetStrategy,
  newElement = { name: '', description: '', status: 'Created' },
  handleCreateInitiative,
  handleCreateInitiativeChange,
  handleCancelCreateInitiative
}) => {
  // Fallback for newElement to ensure it's always an object
  const safeNewElement = newElement || { name: '', description: '', status: 'Created' };

  // Debug log - remove after fixing
  console.log('Rendering CreateInitiativeForm with:', {
    targetStrategy,
    hasName: !!targetStrategy?.name,
    newElement: safeNewElement
  });

  // Fallback strategy name if targetStrategy is not available
  const strategyName = targetStrategy?.name || 'No Strategy Selected';

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
          ? `For Strategy ${strategyName}: add a new Initiative that is value creation driven:` 
          : `Add a new Initiative to selected strategy (DEBUG: name missing)` }
      </h3>
      
      {/* Name Input */}
      <input
        type="text"
        name="name"
        value={safeNewElement.name || ''}  // Safe access to name
        onChange={handleCreateInitiativeChange}
        placeholder="Name"
        className={styles.initiativeInput}
        required
      />

      {/* Description Textarea */}
      <textarea
        name="description"
        value={safeNewElement.description || ''}  // Safe access to description
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
        value={safeNewElement.status || 'Created'}  // Safe access to status
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
