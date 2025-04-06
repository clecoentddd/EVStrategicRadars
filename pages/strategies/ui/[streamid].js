import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './streamid.module.css';
import Navbar from "./navbar"; 
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { useHandlers } from './handlers';

export default function StrategyStream() {
  const router = useRouter();
  const streamid = Object.values(router.query)[0];
  console.log("StrategyStream: streamid is", streamid);
  
  
  const [streamData, setStreamData] = useState([]);
  const [streamAggregate, setStreamAggregate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize handlers hook with all required parameters
  const {
    editableElementId,
    tempData,
    setTempData,
    showCreateStrategyForm,
    newStrategy,
    availableTags,
    collapsedStrategies,
    targetStrategy,
    editableStrategyId,
    tempStrategyData,
    expandedElementId,
    showCreateElementForm,
    newElement,
    handleEditStrategyClick,
    handleSaveStrategyClick,
    handleEditInitiative,
    handleCancelClick,
    handleFieldChange,
    handleElementExpand,
    handleSaveInitiative,
    handleCreateStrategyChange,
    handleCreateInitiative,
    handleCreateInitiativeChange,
    handleCreateStrategy,
    handleCancelCreateInitiative,
    handleCancelCreateStrategy,
    setShowCreateStrategyForm,
    setShowCreateInitiativeForm,
    setTargetStrategy,
    setEditableStrategyId,
    setTempStrategyData,
    toggleStrategyCollapse,
  } = useHandlers(streamid, setStreamData, setStreamAggregate, setLoading, setError);

  const fetchStreamData = async () => {
    try {
      setLoading(true);

      console.log('fetchStreamData - what stream', streamid);
      const aggregateResponse = await fetch(`/api/readmodel-strategies?stream_aggregate=${streamid}`);
      if (!aggregateResponse.ok) {
        throw new Error(`fetchStreamData: Failed to fetch aggregate data: ${aggregateResponse.statusText}`);
      }
      const aggregateStream = await aggregateResponse.json();

      console.log("fetchStreamData: Stream Aggregate id fetched is", aggregateStream.radarId);
      console.log("fetchStreamData: Stream Aggregate name fetched is", aggregateStream.name);

      setStreamAggregate(aggregateStream || null);

      const streamResponse = await fetch(`/api/readmodel-strategies?stream_id=${streamid}`);
      console.log("fetchStreamData: Stream data response:", streamResponse);

      if (!streamResponse.ok) {
        throw new Error(`Failed to fetch stream data: ${streamResponse.statusText}`);
      }
      const streamData = await streamResponse.json();

      setStreamData(streamData.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at); 
      }));
      console.log("fetchStreamData: Stream data fetched is (streamData)", streamData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const organizeData = (streamData) => {
    if (!streamData) {
      console.error("streamData is undefined.");
      return [];
    }
    const strategies = {};

    console.log("organizeData", streamData);
  
    for (const key in streamData) {
      if (key !== 'length') { 
        const item = streamData[key]; 
        console.error("organizeData: streamData item:", item);
        if (item.type === "STRATEGY") {
          strategies[item.id] = { ...item, elements: [] };
        } else if (item.type === "INITIATIVE") {
          if (strategies[item.strategy_id]?.elements) {
            strategies[item.strategy_id].elements.push(item);
          }
        }
      }
    }
  
    return Object.values(strategies);
  };

  useEffect(() => {
    if (!router.isReady) return;

    console.log("useEffect, fetchStreamData...");
    fetchStreamData();
   
  }, [router.isReady, streamid]);

  const getRadarUrl = (streamAggregate) => {
    if (!streamAggregate || !streamAggregate.radarId) {
      return '';
    }
    const name = streamAggregate.name;
    const radarId = streamAggregate.radarId;
    return `/radars/ui/${encodeURIComponent(name)}?radarId=${encodeURIComponent(radarId)}`;
  };

  const renderStrategies = (strategies) => {
    if (!strategies || strategies.length === 0) {
      return <div>No strategies available</div>;
    }
  
    const validStates = ["Draft", "Published", "Closed", "Deleted"];
  
    const groupedStrategies = (Array.isArray(strategies) ? strategies : []).reduce((acc, strategy) => {
      const state = strategy?.state;
  
      if (state && validStates.includes(state)) {
        if (!acc[state]) {
          acc[state] = [];
        }
        acc[state].push(strategy);
      }
      return acc;
    }, {});

    const orderedGroupedStrategies = validStates
      .filter((state) => groupedStrategies[state])
      .map((state) => [state, groupedStrategies[state]]);

    return orderedGroupedStrategies.map(([state, stateStrategies]) => (
      <div key={state} className="strategyGroup">
        <h2>{state}</h2>
        {stateStrategies.map((strategy) => (
          <div key={strategy.id} className={styles.strategyStyle}>
            <div
              className={
                state === "Draft"
                  ? styles.strategyHeaderDraft
                  : state === "Published"
                  ? styles.strategyHeaderPublished
                  : styles.strategyHeaderDefault
              }
              onClick={() => {
                toggleStrategyCollapse(strategy.id);
              }}
            >
              <span className={styles.strategyTitleStyle}>{`${strategy.name} (${strategy.state})`}</span>
            </div>
          
            {collapsedStrategies[strategy.id] && (
              <div className={styles.strategyDetailsContainer}>
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
                        onClick={() => {
                          handleEditStrategyClick(strategy);
                        }}
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
                          className={styles.editableTextarea}
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
                          className={styles.editableTextarea}
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
                          className={styles.editableSelect}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Published">Published</option>
                          <option value="Closed">Closed</option>
                          <option value="Deleted">Deleted</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.buttonGroupContainer}>
                      <button 
                        type="submit" 
                        className={styles.saveButton}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => setEditableStrategyId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            <div id={`elements-${strategy.id}`} className="initiatives">
              {strategy.elements && strategy.elements.map((initiative) => (
                <div key={initiative.id} className={styles.initiative}>
                  <div
                    className={`${styles.initiativeHeader} ${
                      strategy.state !== "Closed" ? styles.openState : styles.closedState
                    }`}
                    onClick={() => handleElementExpand(initiative.id)}
                  >
                    <span className={styles.initiativeTitleStyle}>{`${initiative.name} (${initiative.state})`}</span>
                  </div>

                  {expandedElementId === initiative.id && (
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

                        <label className={styles.labelInitiativeStyle}>
                          <span className={styles.fieldLabel}>Description</span>
                          <textarea
                            value={tempData?.description || initiative.description || ""}
                            onChange={(e) => handleFieldChange("description", e.target.value)}
                            disabled={editableElementId !== initiative.id}
                            className={
                              editableElementId === initiative.id
                                ? `${styles.textAreaInitiativeDescription} ${styles.textAreaInitiativeDescriptionEditable}`
                                : styles.textAreaInitiativeDescription
                            }
                          />
                        </label>
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
                                    onChange={(e) => handleFieldChange(field, e.target.value)}
                                    className={styles.textArea}
                                    autoFocus
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

                                  if (selectedTag) {
                                    const currentTags = Array.isArray(tempData?.tags)
                                      ? tempData.tags
                                      : JSON.parse(tempData?.tags || "[]");

                                    const isDuplicate = currentTags.some((tag) => tag.id === selectedTag.id);

                                    if (!isDuplicate) {
                                      const updatedTags = [...currentTags, selectedTag];
                                      setTempData((prev) => ({
                                        ...prev,
                                        tags: updatedTags,
                                      }));
                                    }
                                  }
                                }}
                                className={styles.tagDropdown}
                              >
                                <option value="">Select a tag</option>
                                {availableTags.map((tag) => (
                                  <option key={tag.id} value={tag.id}>
                                    {tag.name}
                                  </option>
                                ))}
                              </select>

                              <ul className={styles.tagsList}>
                                {(Array.isArray(tempData?.tags)
                                  ? tempData.tags
                                  : JSON.parse(tempData?.tags || "[]")
                                ).map((tag, index) => (
                                  <li key={index} className={styles.tagItem}>
                                    {tag.name}
                                    <button
                                      type="button"
                                      className={styles.removeTagButton}
                                      onClick={() => {
                                        const updatedTags = (
                                          Array.isArray(tempData?.tags)
                                            ? tempData.tags
                                            : JSON.parse(tempData?.tags || "[]")
                                        ).filter((t) => t.id !== tag.id);

                                        setTempData((prev) => ({
                                          ...prev,
                                          tags: updatedTags,
                                        }));
                                      }}
                                    >
                                      X
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div>
                              {initiative.tags ? (
                                Array.isArray(initiative.tags)
                                  ? initiative.tags.map((tag, index) => (
                                      <span key={index} className={styles.tagReadonly}>
                                        {tag.name}
                                      </span>
                                    ))
                                  : JSON.parse(initiative.tags).map((tag, index) => (
                                      <span key={index} className={styles.tagReadonly}>
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
              ))}
            </div>
          </div>
        ))}
      </div>
    ));
  };

  return (
    <>
      <div>
        <Navbar getRadarUrl={getRadarUrl} streamAggregate={streamAggregate} />
      </div>

      <div className={styles.container}>
        <div className={styles.streamHeader}>
          <h1>
            {streamAggregate && streamAggregate.name ? streamAggregate.name : "Loading..."}
          </h1>
          <h2>This is about strategic thinking now</h2>
        </div>
      </div>

      <div className={styles.container}>
        <button
          className={styles.createStrategyButtonStyle}
          onClick={() => setShowCreateStrategyForm(true)}
        >
          Create Strategy
        </button>

        {showCreateStrategyForm && (
          <div className={styles.strategyFormContainer}>
            <form onSubmit={handleCreateStrategy}>
              <h3>Create Strategy</h3>
              <input
                type="text"
                name="name"
                value={newStrategy.name}
                onChange={handleCreateStrategyChange}
                placeholder="Name"
                required
              />
              <textarea
                name="description"
                value={newStrategy.description}
                onChange={handleCreateStrategyChange}
                placeholder="Description"
                rows="3"
                required
              ></textarea>
              <textarea
                name="whatwewillnotdo"
                value={newStrategy.whatwewillnotdo}
                onChange={handleCreateStrategyChange}
                placeholder="What we will not do"
                rows="3"
              ></textarea>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.submitButton}>
                  Create
                </button>
                <button 
                  type="button" 
                  onClick={handleCancelCreateStrategy} 
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {showCreateElementForm && targetStrategy && (
          <form className={styles.createInitiativeFormStyle} onSubmit={(e) => handleCreateInitiative(e)}>
            <h3>For {targetStrategy.name} : Add a new Initiative that is value creation driven:</h3>
            <input
              type="text"
              name="name"
              value={newElement.name}
              onChange={(e) => handleCreateInitiativeChange(e)}
              placeholder="Name"
              required
            />
            <textarea
              name="description"
              value={newElement.description}
              onChange={(e) => handleCreateInitiativeChange(e)}
              placeholder="Description"
              rows="3"
              required
            ></textarea>
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
        )}

        {loading && <p>Loading stream data...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {streamData && Array.isArray(streamData) ? (
          <div>
            <h2>Strategies</h2>
            {renderStrategies(streamData)}
          </div>
        ) : (
          <div style={{ color: "red" }}>No strategies defined yet.</div>
        )}
      </div>
    </>
  );
}