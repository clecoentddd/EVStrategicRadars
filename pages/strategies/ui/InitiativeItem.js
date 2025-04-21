import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import styles from './InitiativeItem.module.css';

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
    <div className={styles.initiative}>
            <div
        className={`${styles.initiativeHeader} ${
          strategy.state !== "Closed" ? styles.openState : styles.closedState
        }`}
        onClick={onExpand}  // Use the passed handler
      >
        <span className={styles.initiativeTitleStyle}>
          {initiative.name} ({initiative.status || "Created"})
        </span>
      </div>

      {isExpanded && (
        <div className={styles.initiativeDetails}>
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

            {/* Add Status Dropdown */}
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

            {/* Add Percentage Field - Only show when status is "In progress" */}
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
                          // Auto-expand the textarea
                          e.target.style.height = 'auto';
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        className={styles.textArea}
                        autoFocus
                        onFocus={(e) => {
                          // Initial expansion on focus
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

          <ReactTooltip
            anchorId="diagnosis"
            place="top"
            content={
              <span>
                We need facts and data. Be very mindful of biases like the echo chamber.
                <br />
                Be careful of logical arguments.
                <br />
                Tools such as Wardley mapping can be used here. Remmember WTP/WTS as willingness to pay and sell: how are you going to create vakue for customers?
              </span>
            }
            className={styles.customTooltip}
          />
          <ReactTooltip
            anchorId="overallApproach"
            place="top"
            content={
              <span>
                The overall approach for overcoming the obstacles highlighted by the diagnosis. It channels actions in certain directions without defining exactly what shall be done.<br />
                It directs and constraints action without fully defining its content.<br />
                And it defines a method of grappling with the situation and rouling out a vast array of possible actions
                approach.
              </span>
            }
            className={styles.customTooltip}
          />
          <ReactTooltip
            anchorId="coherentActions"
            place="top"
            content={<span>Ensure you have a set of coherent actions</span>}
            className={styles.customTooltip}
          />
          <ReactTooltip
            anchorId="proximateObjectives"
            place="top"
            content={
              <span>
                You want to make your strategy concrete, executable in the very short-term so
                people can believe you are walking the talk
              </span>
            }
            className={styles.customTooltip}
          />

          <div className={styles.tagsContainer}>
            <strong>Tags</strong>
            <div>
              {editableElementId === initiative.id ? (
                <div>
                  <select
                    value=""
                    onChange={(e) => {
                      const selectedTagId = e.target.value;
                      const selectedTag = availableTags.find((tag) => tag.id === selectedTagId);

                      console.log('availableTags:', availableTags);

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
                    <option value="">Select a tag</option>
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
export default InitiativeItem;  // Must have this default export