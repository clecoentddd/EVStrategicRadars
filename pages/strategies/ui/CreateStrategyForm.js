import React from 'react';
import styles from './CreateStrategyForm.module.css';

const CreateStrategyForm = ({ 
  newStrategy = {}, 
  handleCreateStrategyChange, 
  handleCreateStrategy, 
  handleCancelCreateStrategy 
}) => {
  // Debugging: Log props to verify they're received
  console.log('CreateStrategyForm props:', {
    newStrategy,
    hasChangeHandler: !!handleCreateStrategyChange,
    hasSubmitHandler: !!handleCreateStrategy,
    hasCancelHandler: !!handleCancelCreateStrategy
  });

  // Safeguard: Throw errors if handlers are missing
  if (!handleCreateStrategyChange) throw new Error('handleCreateStrategyChange is required');
  if (!handleCreateStrategy) throw new Error('handleCreateStrategy is required');
  if (!handleCancelCreateStrategy) throw new Error('handleCancelCreateStrategy is required');

  return (
    <div className={styles.formContainer}>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleCreateStrategy(e);
      }}>
        <h3 className={styles.title}>Create a Strategy</h3>
        
        <input
          type="text"
          name="name"
          value={newStrategy.name || ''}
          onChange={handleCreateStrategyChange}
          placeholder="Name"
          className={styles.formInput}
          required
        />
        
        <textarea
          name="description"
          value={newStrategy.description || ''}
          onChange={handleCreateStrategyChange}
          placeholder="Description"
          className={styles.formTextarea}
          rows={3}
          required
        />
        
        <textarea
          name="whatwewillnotdo"
          value={newStrategy.whatwewillnotdo || ''}
          onChange={handleCreateStrategyChange}
          placeholder="What we will not do"
          className={styles.formTextarea}
          rows={3}
        />
        
        <div className={styles.buttonGroup}>
          <button 
            type="submit"
            className={styles.primaryButton}
          >
            Create
          </button>

          <button 
            type="button" 
            className={styles.secondaryButton}
            onClick={handleCancelCreateStrategy}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStrategyForm;