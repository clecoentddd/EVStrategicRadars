import React from 'react';
import InitiativeItem from './InitiativeItem'; 
import styles from './StrategyItem.module.css';

export default function StrategyItem({ strategy, handlers, streamAggregate }) {
  const {
    editableStrategyId,
    tempStrategyData,
    collapsedStrategies,
    toggleStrategyCollapse,
    handleEditStrategyClick,
    handleSaveStrategyClick,
    setTargetStrategy,
    setShowCreateInitiativeForm,
    setEditableStrategyId,
    setTempStrategyData,
    expandedElementId,
    handleElementExpand,
    handleSaveInitiative,
    handleCancelClick,
    handleFieldChange,
    handleEditInitiative,
    tempData,
    setTempData,
    editableElementId,
    availableTags
  } = handlers;

  return (
    <div className={styles.strategyStyle}>
      {/* Strategy Header */}
      <div
        className={
          strategy.state === "Draft" ? styles.strategyHeaderDraft :
          strategy.state === "Published" ? styles.strategyHeaderPublished :
          styles.strategyHeaderDefault
        }
        onClick={() => toggleStrategyCollapse(strategy.id)}
      >
        <span className={styles.strategyTitleStyle}>
          {strategy.name} ({strategy.state})
        </span>
      </div>
    
      {collapsedStrategies[strategy.id] && (
        <div className={styles.strategyDetailsContainer}>
          {/* View Mode */}
          {editableStrategyId !== strategy.id && (
            <>
              <div className={styles.strategyContent}>
                <div className={styles.strategySection}>
                  <h4>Description</h4>
                  <p>{strategy.description}</p>
                </div>
                <div className={styles.strategySection}>
                  <h4>What We Will Not Do</h4>
                  <p>{strategy.whatwewillnotdo}</p>
                </div>
                <div className={styles.strategySection}>
                  <h4>Status</h4>
                  <p>{strategy.state}</p>
                </div>
              </div>
              
              <div className={styles.buttonGroupContainer}>
                <button
                  className={styles.editStrategyButton}
                  onClick={() => handleEditStrategyClick(strategy)}
                >
                  Edit
                </button>
                <button
                  className={styles.createInitiativeButtonStyle}
                  onClick={() => {
                    setTargetStrategy(strategy);
                    setShowCreateInitiativeForm(true);
                  }}
                >
                  Add Initiative
                </button>
              </div>
            </>
          )}

          {/* Edit Mode - UPDATED CLASSES */}
          {editableStrategyId === strategy.id && (
            <form 
              className={styles.inlineEditForm}
              onSubmit={(e) => handleSaveStrategyClick(e, strategy)}
            >
              <div className={styles.strategyContent}>
                <div className={styles.strategySection}>
                  <h4>Description</h4>
                  <textarea
                    name="description"
                    value={tempStrategyData?.description || ''}
                    onChange={(e) => setTempStrategyData({ 
                      ...tempStrategyData, 
                      description: e.target.value 
                    })}
                    className={`${styles.textAreaInitiativeName} ${styles.textAreaInitiativeNameEditable}`}
                    rows="4"
                  />
                </div>
                
                <div className={styles.strategySection}>
                  <h4>What We Will Not Do</h4>
                  <textarea
                    name="whatwewillnotdo"
                    value={tempStrategyData?.whatwewillnotdo || ''}
                    onChange={(e) => setTempStrategyData({ 
                      ...tempStrategyData, 
                      whatwewillnotdo: e.target.value 
                    })}
                    className={`${styles.textAreaInitiativeName} ${styles.textAreaInitiativeNameEditable}`}
                    rows="4"
                  />
                </div>
                
                <div className={styles.strategySection}>
                  <h4>Status</h4>
                  <select
                    value={tempStrategyData?.state || 'Draft'}
                    onChange={(e) => setTempStrategyData({ 
                      ...tempStrategyData, 
                      state: e.target.value 
                    })}
                    className={styles.statusDropdown}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Closed">Closed</option>
                    <option value="Deleted">Deleted</option>
                  </select>
                </div>
              </div>

              <div className={`${styles.buttonGroupContainer} ${styles.rowButtonsEditCancelSave}`}>
                <button 
                  type="submit" 
                  className={styles.saveElementButton}
                >
                  Save
                </button>
                <button
                  type="button"
                  className={styles.cancelElementButton}
                  onClick={() => setEditableStrategyId(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Initiatives List */}
          <div id={`elements-${strategy.id}`} className="initiatives">
          {strategy.elements
            ?.filter(initiative => initiative && initiative.id) // Remove null/undefined and items without IDs
            .map(initiative => {
              const initiativeId = initiative.id; // Get ID once to avoid repetition
              
              return (
                <InitiativeItem 
                  key={initiativeId}
                  initiative={initiative}
                  isExpanded={expandedElementId === initiativeId}
                  onExpand={() => handleElementExpand(initiativeId)}
                  handlers={{
                    handleSaveInitiative,
                    handleCancelClick,
                    handleFieldChange,
                    handleEditInitiative,
                    tempData,
                    setTempData,
                    editableElementId,
                    availableTags
                  }}
                  strategy={strategy}
                  streamAggregate={streamAggregate}
                />
              );
            })
          }
          </div>
        </div>
      )}
    </div>
  );
}