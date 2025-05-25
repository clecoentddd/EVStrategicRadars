import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import styles from './InitiativeItem.module.css';
import RelatedInitiatives from './RelatedInitiatives';

const InitiativeItem = ({
  initiative,
  strategy,
  isExpanded,
  onExpand,
  handlers,
  streamAggregate
}) => {
  const {
    editableElementId,
    tempData,
    handleFieldChange,
    handleSaveInitiative,
    handleCancelClick,
    handleEditInitiative,
    availableTags,
    setTempData
  } = handlers;

return (
  <div className={`${styles.initiative} ${isExpanded ? styles.expanded : ''}`}>
    <div
  className={`${styles.initiativeHeader} ${
    strategy.state !== "Closed" ? styles.openState : styles.closedState
  }`}
  onClick={onExpand}
>
  <div className={styles.titleMetaWrapper}>
    <span className={styles.initiativeTitleStyle}>
      {initiative.name}
    </span>
    <div className={styles.initiativeMetaRow}>
      <span className={styles.statusLabel}>{initiative.status || "Created"}</span>
      {initiative.status === "In progress" && (
        <span className={styles.progressLabel}>
          {initiative.progress || 0}%
        </span>
      )}
    </div>
  </div>
</div>


    {isExpanded && (
      <div className={styles.initiativeDetails}>
        {/* All your existing form content remains exactly the same */}
        <div className={styles.horizontalAlignmentWrapper}>
          <label className={styles.labelInitiativeStyle}>
            <span className={styles.fieldLabel}>Name of the initiative</span>
            <textarea
              value={tempData?.name || initiative.name || ""}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              disabled={editableElementId !== initiative.id}
              className={
                editableElementId === initiative.id
                  ? `${styles.textAreaInitiativeName} ${styles.textAreaInitiativeNameEditable}`
                  : styles.textAreaInitiativeName
              }
            />
          </label>

          {/* Status Dropdown */}
          <label className={styles.labelInitiativeStyle}>
            <span className={styles.fieldLabel}>Status</span>
            <select
              value={tempData?.status || initiative.status || "Created"}
              onChange={(e) => handleFieldChange("status", e.target.value)}
              disabled={editableElementId !== initiative.id}
              className={styles.statusDropdown}
            >
              <option value="Created">Created</option>
              <option value="In progress">In progress</option>
              <option value="Closed">Closed</option>
            </select>
          </label>

          {/* Percentage Field */}
          {(tempData?.status === "In progress" || initiative.status === "In progress") && (
            <label className={styles.labelInitiativeStyle}>
              <span className={styles.fieldLabel}>Progress (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                value={tempData?.progress || initiative.progress || 0}
                onChange={(e) => handleFieldChange("progress", e.target.value)}
                disabled={editableElementId !== initiative.id}
                className={styles.progressInput}
              />
            </label>
          )}
        </div>

        <table className={styles.tableStyle}>
          {/* Table content remains exactly the same */}
          <thead>
            <tr>
              <th id="diagnosis" className={styles.headerInitiativeTable}>Diagnosis</th>
              <th id="overallApproach" className={styles.headerInitiativeTable}>Overall Approach</th>
              <th id="coherentActions" className={styles.headerInitiativeTable}>Set of Coherent Actions</th>
              <th id="proximateObjectives" className={styles.headerInitiativeTable}>Proximate Objectives</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {["diagnosis", "overall_approach", "set_of_coherent_actions", "proximate_objectives"].map((field) => (
                <td
                  key={field}
                  className={
                    editableElementId === initiative.id
                      ? `${styles.tableCell} ${styles.tableCellEditable}`
                      : styles.tableCell
                  }
                >
                  {editableElementId === initiative.id ? (
                    <textarea
                      value={tempData?.[field] || ""}
                      onChange={(e) => {
                        handleFieldChange(field, e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      className={styles.textArea}
                      autoFocus
                      onFocus={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                    />
                  ) : (
                    initiative[field] || "N/A"
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* Keep all your existing tooltips exactly the same */}
        <ReactTooltip
          anchorId="diagnosis"
          place="top"
          content={
            <span>
              We need facts and data. Be very mindful of biases like the echo chamber.
              <br />
              Be careful of logical arguments.
              <br />
              Tools such as Wardley mapping can be used here. Remmember WTP/WTS as willingness to pay and sell: how are you going to create value for customers?
            </span>
          }
          className={styles.customTooltip}
        />
        {/* Other tooltips remain unchanged */}

        {/* Tags section remains exactly the same */}
        <div className={styles.tagsContainer}>
          <div className={styles.risksHeader}>Risks tackled by this initiative</div>
          <div>
            {editableElementId === initiative.id ? (
              <div>
                <select
                  value=""
                  onChange={(e) => {
                    const selectedTagId = e.target.value;
                    const selectedTag = availableTags.find((tag) => tag.id === selectedTagId);
                    const currentTags = Array.isArray(tempData?.tags)
                      ? tempData.tags
                      : JSON.parse(tempData?.tags || "[]");

                    if (selectedTag && !currentTags.some((tag) => tag.id === selectedTag.id)) {
                      const updatedTags = [...currentTags, selectedTag];
                      setTempData((prev) => ({
                        ...prev,
                        tags: updatedTags,
                      }));
                    }
                  }}
                  className={styles.tagDropdown}
                >
                  <option value="">Select risks this initiative is dealing with</option>
                  {availableTags
                    .filter((tag) => {
                      const currentTags = Array.isArray(tempData?.tags)
                        ? tempData.tags
                        : JSON.parse(tempData?.tags || "[]");
                      return !currentTags.some((t) => t.id === tag.id);
                    })
                    .map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                </select>

                <ul className={styles.tagsList}>
                  {(Array.isArray(tempData?.tags)
                    ? tempData.tags
                    : JSON.parse(tempData?.tags || "[]")
                  ).map((tag) => (
                    <li key={tag.id} className={styles.tagItem}>
                      {tag.name}
                      <button
                        type="button"
                        className={styles.removeTagButton}
                        onClick={() => {
                          const currentTags = Array.isArray(tempData?.tags)
                            ? tempData.tags
                            : JSON.parse(tempData?.tags || "[]");
                          const updatedTags = currentTags.filter((t) => t.id !== tag.id);
                          setTempData((prev) => ({
                            ...prev,
                            tags: updatedTags,
                          }));
                        }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className={styles.tagsReadonlyContainer}>
                {(Array.isArray(initiative.tags)
                  ? initiative.tags
                  : JSON.parse(initiative.tags || "[]")
                ).length > 0 ? (
                  (Array.isArray(initiative.tags)
                    ? initiative.tags
                    : JSON.parse(initiative.tags || "[]")
                  ).map((tag) => (
                    <span key={tag.id} className={styles.tagReadonly}>
                      {tag.name}
                    </span>
                  ))
                ) : (
                  <span>No tags</span>
                )}
              </div>
            )}
          </div>
        </div>

        <RelatedInitiatives initiativeId={initiative.id} />

        <div className={styles.rowButtonsEditCancelSave}>
          {editableElementId === initiative.id ? (
            <>
              <button
                className={styles.saveElementButton}
                onClick={() => handleSaveInitiative(strategy, initiative)}
              >
                Save
              </button>
              <button className={styles.cancelElementButton} onClick={handleCancelClick}>
                Cancel
              </button>
            </>
          ) : (
            <button
              className={styles.editElementButton}
              onClick={() => handleEditInitiative(streamAggregate, initiative)}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    )}
  </div>
);
};

export default InitiativeItem;
