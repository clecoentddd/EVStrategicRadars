import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './streamid.module.css';
import Navbar from "./navbar"; 
// import { EXPORT_DETAIL } from 'next/dist/shared/lib/constants';
import { Tooltip as ReactTooltip } from 'react-tooltip';

export default function StrategyStream() {
  const router = useRouter();

  const streamid = Object.keys(router.query)[0];
  const [streamData, setStreamData] = useState({
    data: [], // Initialize data as an empty array
  });
  const [streamAggregate, setStreamAggregate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editableElementId, setEditableElementId] = useState(null);
  const [tempData, setTempData] = useState(null);

  const [showCreateStrategyForm, setShowCreateStrategyForm] = useState(false);
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    description: '',
    whatwewillnotdo: '',
  });

  const [availableTags, setAvailableTags] = useState([]); // Tags fetched from API

  const [collapsedStrategies, setCollapsedStrategies] = useState({});
  const [targetStrategy, setTargetStrategy] = useState(null);

  // Strategy Edit & Save
  const [editableStrategyId, setEditableStrategyId] = useState(null); // Track which strategy is being edited
  const [tempStrategyData, setTempStrategyData] = useState(null); // Temporary data for editing


  // Handle Edit Strategy Click
const handleEditStrategyClick = (strategy) => {
  setEditableStrategyId(strategy.id);
  setTempStrategyData({
    name: strategy.name,
    description: strategy.description,
    whatwewillnotdo: strategy.whatwewillnotdo,
    state: strategy.state,
  });
};

// Handle Save Strategy Click
const handleSaveStrategyClick = async (e, strategy) => {
  e.preventDefault();
  try {
      // Ensure stream_id is available (e.g., from the router or state)
      const streamId = streamid; // Assuming stream_id is available in the router query
      console.log("handleSaveStrategyClick with streamID",streamid );
      if (!streamId) {
          throw new Error("streamId is required");
      }

      // Call the API to update the strategy
      const response = await fetch(`/api/strategy-strategies?strategyId=${strategy.id}&streamId=${streamId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tempStrategyData),
      });

      if (!response.ok) {
          throw new Error("Failed to update strategy");
      }

      // Update the UI with the new strategy data
      setStreamData((prevData) =>
          prevData.map((strat) =>
              strat.id === strategy.id ? { ...strat, ...tempStrategyData } : strat
          )
      );

      alert("Strategy updated successfully!");
      setEditableStrategyId(null); // Exit edit mode
  } catch (err) {
      alert(`Error: ${err.message}`);
  }
};

  const handleEditClick = async (strategy,initiative) => {
    setEditableElementId(initiative.id);

    // Save the original data of the row being edited
    console.log ("handleEditClick ", strategy);
    console.log ("handleEditClick ", initiative.id);
    const currentRow = initiative
    console.log ("handleEditClick currentRow", currentRow);
    setTempData({ ...currentRow });

      
    try {
        const response = await fetch(`/api/radar-items?radarId=${streamAggregate.radarId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json', // Indicate you expect JSON
          },
        });
    
        // Check if the response is OK (status code 200-299)
        if (!response.ok) {
          throw new Error(`Failed to fetch radar items: ${response.statusText}`);
        }
    
        console.log("handleEditClick get radar items", response.text);
        const data = await response.json();
    
        // Validate the structure of the returned data (example below)
            // Validate that the data is an array of objects with 'name' and 'id'
    if (
      !Array.isArray(data) ||
      !data.every(item => item && typeof item.name === 'string' && typeof item.id === 'string')
    ) {
      throw new Error('Invalid data format received from API');
    }

    // Map to extract `name` and `id` for further use
    const tags = data.map(({ name, id }) => ({ name, id }));

    setAvailableTags(tags); // Update available tags with name and id
  } catch (error) {

        console.error('Error fetching radar items:', error.message);
        alert('Could not fetch radar items. Please try again later.');
      }
  };

  const handleCancelClick = () => {

      setEditableElementId(null); // Exit edit mode
      setTempData(null); // Discard temporary edits
  };

  const handleFieldChange = (fieldName, value) => {
    setTempData((prev) => ({
      ...prev,
      [fieldName]: fieldName === "tags"
        ? 
          // Try to parse the input as a JSON array 
          // If parsing fails, assume it's an empty array
          (() => {
            try {
              return JSON.parse(value); 
            } catch (error) {
              console.error("Error parsing tags:", error); 
              return []; 
            }
          })()
        : value, 
    }));
  };

  const [expandedElementId, setExpandedElementId] = useState(null);

  const [showCreateInitiativeForm, setShowCreateInitiativeForm] = useState(false);

  const [newElement, setNewElement] = useState({
    name: '',
    description: '',
  });

      
  const fetchStreamData = async () => {
    try {
      setLoading(true);

      // Fetch aggregate data and stream data in one go if needed
      console.log('fetchStreamData - what stream',streamid);
      const aggregateResponse = await fetch(`/api/readmodel-strategies?stream_aggregate=${streamid}`);
      if (!aggregateResponse.ok) {
        throw new Error(`fetchStreamData: Failed to fetch aggregate data: ${aggregateResponse.statusText}`);
      }
      const aggregateStream= await aggregateResponse.json();

      console.log ("fetchStreamData: Stream Aggregate id fetched is", aggregateStream.radarId);
      console.log ("fetchStreamData: Stream Aggregate name fetched is", aggregateStream.name);

      // Extract radarId from aggregate data
      setStreamAggregate(aggregateStream || null);

      // Fetch stream data if needed
      const streamResponse = await fetch(`/api/readmodel-strategies?stream_id=${streamid}`);
      console.log("fetchStreamData: Stream data response:", streamResponse);

      if (!streamResponse.ok) {
        throw new Error(`Failed to fetch stream data: ${streamResponse.statusText}`);
      }
      const streamData= await streamResponse.json();

      setStreamData(streamData.sort((a, b) => {
        // Compare the 'created_at' property of each object
        return new Date(b.created_at) - new Date(a.created_at); 
      }));
      console.log ("fetchStreamData: Stream data fetched is (streamData)", streamData);

      //const organizedData = organizeData(streamData); 
      // Use the organizedData here, for example:
      //console.log("Organized data:", organizedData); 

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const organizeData = (streamData) => {
    
    if (!streamData) {
      console.error("streamData is undefined.");
      return []; // Or handle the error appropriately
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
      return ''; // Handle cases where streamAggregate is missing or invalid
    }
    const name = streamAggregate.name; // Assuming 'name' is available in streamAggregate
    const radarId = streamAggregate.radarId;
    return `/radars/ui/${encodeURIComponent(name)}?radarId=${encodeURIComponent(radarId)}`;
  };

  const handleElementExpand = (InitiativeId) => {
    console.log("handleElementExpand - 1");
    setExpandedElementId(expandedElementId === InitiativeId ? null : InitiativeId);
  };

  const toggleStrategyCollapse = (strategyId) => {
    setCollapsedStrategies((prev) => ({
      ...prev,
      [strategyId]: !prev[strategyId], // Toggle the collapse state
    }));
  };

  const handleSaveClick = async (strategy, initiative) => {
    if (!editableElementId || !tempData) {
      alert("No changes to save or invalid initiative.");
      return;
    }
  
    try {
      // Step 1: Make the API call to update the backend
      const response = await fetch(`/api/strategy-initiatives?initiativeId=${editableElementId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stream_id: tempData.stream_id,
          strategy_id: tempData.strategy_id,
          diagnosis: tempData.diagnosis,
          overall_approach: tempData.overall_approach,
          set_of_coherent_actions: tempData.set_of_coherent_actions,
          proximate_objectives: tempData.proximate_objectives,
          name: tempData.name,
          description: tempData.description,
          tags: tempData.tags,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save changes");
      }
  
      // Step 2: Update `streamData` only if the API call succeeds
      setStreamData((prevData) => {
        return prevData.map((strat) => {
          // Update the specific strategy
          if (strat.id === strategy.id) {
            return {
              ...strat,
              elements: strat.elements.map((el) =>
                el.id === initiative.id ? { ...tempData } : el
              ),
            };
          }
          return strat;
        });
      });
  
      alert("Changes saved successfully!");
  
      // Exit edit mode and clear temporary data
      setEditableElementId(null);
      setTempData(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };
       
  const handleCreateStrategyChange = (e) => {
    const { name, value } = e.target;
    setNewStrategy((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateInitiative = async (e) => {
    e.preventDefault();

    if (!targetStrategy) {
      console.error("No target strategy selected for creating an initiative.");
      return;
    }
   
    try {
      const response = await fetch(`/api/strategy-initiatives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stream_id: streamid,
          strategy_id: targetStrategy.id, // Pass the open strategy ID
          name: newElement.name,
          description: newElement.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create a strategic initative');
      }

      const data = await response.json();
      alert('Strategy initiative created successfully!');
      console.log("Optimistic UI with data", data);
      console.log("Optimistic UI with prev.data", streamData);
      setShowCreateInitiativeForm(false);
      setNewElement({ name: '', description: '' });

       // Step 2: Update `streamData` only if the API call succeeds
       setStreamData((prevData) => {
        console.log("New Data to Insert:", data); // Log the `data` object being inserted
        console.log("Target Strategy ID:", targetStrategy.id); // Log the target strategy ID
      
        return prevData.map((strat) => {
          console.log("Processing Strategy:", strat); // Log the current strategy being processed
          if (strat.id === targetStrategy.id) {
            console.log("Match Found! Updating Strategy:", strat.id); // Log if a match is found
            const updatedStrat = {
              ...strat,
              elements: [...(strat.elements || []), data.createdItem], // Add or update the `data` field
            };
            console.log("Updated Strategy:", updatedStrat); // Log the updated strategy object
            return updatedStrat;
          }
          console.log("No Match for Strategy ID:", strat.id); // Log if no match is found
          return strat; // Return the unchanged strategy
        });
      });
      
      console.log("Optimistic UI with new data", streamData);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  
  const handleCreateElementChange  = (e) => {
    const { name, value } = e.target;
    setNewElement((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateStrategySubmit = async (e) => {
    e.preventDefault();
    try {
        console.log("Calling POST API for", newStrategy);
        const response = await fetch(`/api/strategy-strategies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stream_id: streamid,
              name: newStrategy.name,
              description: newStrategy.description,
              whatwewillnotdo: newStrategy.whatwewillnotdo,
            }),
          });

      if (!response.ok) {
        throw new Error('Failed to create strategy', response.statutsText);
      }

      const eventData = await response.json();
      console.log('Strategy result :', eventData);
      
      /* format data for updating data on the screen */
      const newStrategyData = {
        created_at: eventData.result.timestamp,
        name: eventData.result.payload.name,
        description: eventData.result.payload.description,
        state: eventData.result.payload.state,
        stream_id: eventData.result.payload.stream_id,
        id: eventData.result.payload.id,
        whatwewillnotdo: eventData.result.payload.whatwewillnotdo,
        elements: [], 
      };
      setShowCreateStrategyForm(false);
      console.log('Strategy adding with newStrategyData', newStrategyData);
      setNewStrategy({ name: '', description: '', whatwewillnotdo: '' });

      // reorder based on created_at
      setStreamData([newStrategyData, ...streamData].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at); 
      }));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCancelCreateElement = () => {
    // Reset the newElement state
    setNewElement({ 
      name: '', 
      description: '',
    }); 
    // Optionally, close the form (if it's in a modal or overlay)
    setShowCreateInitiativeForm(false); 
  };

    const handleCancelCreateStrategy = () => {
      setNewStrategy({ 
        name: '', 
        description: '', 
        whatwewillnotdo: '', 
      }); 
      setShowCreateStrategyForm(false); 
    };
  
    const renderStrategies = (strategies) => {
      // Check if strategies exist and group them by state
      if (!strategies || strategies.length === 0) {
        return <div>No strategies available</div>;
      }
    
      const validStates = [ "Draft","Published", "Closed", "Deleted"];
    
      // Group the strategies by state
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

        // Sort the grouped strategies by validStates order
  const orderedGroupedStrategies = validStates
  .filter((state) => groupedStrategies[state]) // Ensure we only include states that exist
  .map((state) => [state, groupedStrategies[state]]);

  // Render grouped strategies
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
              const elementsDiv = document.getElementById(`elements-${strategy.id}`);
              elementsDiv.style.display = elementsDiv.style.display === "none" ? "block" : "none";
            }}
          >
            <span className = {styles.strategyTitleStyle}>{`${strategy.name} (${strategy.state})`}</span>
          </div>
          
           {/* Add Initiative buton */}
        {collapsedStrategies[strategy.id] && (
          <div className={styles.addElementContainer}>
            <button
              className={styles.editStrategyButton}
              onClick={() => handleEditStrategyClick(strategy)}
            >
              Edit
            </button>
            <button
              className={styles.createInitiativeButtonStyle}
              
              onClick={() => {
                setTargetStrategy(strategy); // Track the strategy ID
                console.log("setTargetStrategy(strategy)", strategy);
                setShowCreateInitiativeForm(true);  // Show the form
              }}
            >
              Add Initiative
            </button>
          </div>
        )}

        {/* Edit Strategy Form */}
        {editableStrategyId === strategy.id && (
          <form className={styles.editStrategyForm} onSubmit={(e) => handleSaveStrategyClick(e, strategy)}>
            <h3>Edit Strategy</h3>
            <label>
              Name
              <input
                type="text"
                name="name"
                value={tempStrategyData?.name || strategy.name}
                onChange={(e) => setTempStrategyData({ ...tempStrategyData, name: e.target.value })}
                required
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                value={tempStrategyData?.description || strategy.description}
                onChange={(e) => setTempStrategyData({ ...tempStrategyData, description: e.target.value })}
                rows="3"
                required
              />
            </label>
            <label>
              What We Will Not Do
              <textarea
                name="whatwewillnotdo"
                value={tempStrategyData?.whatwewillnotdo || strategy.whatwewillnotdo}
                onChange={(e) => setTempStrategyData({ ...tempStrategyData, whatwewillnotdo: e.target.value })}
                rows="3"
              />
            </label>
            <label>
              Status
              <select
                name="state"
                value={tempStrategyData?.state || strategy.state}
                onChange={(e) => setTempStrategyData({ ...tempStrategyData, state: e.target.value })}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Closed">Closed</option>
                <option value="Deleted">Deleted</option>
              </select>
            </label>
            <div className={styles.formButtons}>
              <button type="submit" className={styles.saveButton}>
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

        {/* Show elements only if the strategy is collapsed */}
          {collapsedStrategies[strategy.id] && (
            <>
              {/* What We Will Not Do Section */}
              <div className={styles.boldTitle}>
              <strong>Description</strong>
              <p>{strategy.description}</p>
                <strong>What We Will Not Do</strong>
                <p>{strategy.whatwewillnotdo}</p>
              </div>


            </>
          )}

          <div id={`elements-${strategy.id}`} className="initiatives">
                {strategy.elements.map((initiative) => (
                  <div key={initiative.id} className={styles.initiative}>
                    <div
                      className={`${styles.initiativeHeader} ${
                        strategy.state !== "Closed" ? styles.openState : styles.closedState
                      }`}
                      onClick={() => handleElementExpand(initiative.id)}
                    >
                      <span className = {styles.initiativeTitleStyle}>{`${initiative.name} (${initiative.state})`}</span>
                    </div>
    
                    {expandedElementId === initiative.id && (
                      <div className={styles.initiativeDetails}>
                        {/* Name and Description Fields */}
                        <div className={styles.horizontalAlignmentWrapper}>
                        {/* Name of the initiative */}
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

                        {/* Description */}
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

                        {/* Table Fields */}
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
                                      value={tempData[field] || ""}
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

                        {/* Tooltips for the header elements */}
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

                        {/* Tags Field */}
                        <div className={styles.tagsContainer}>
                          <strong>Tags</strong>
                          <div>
                            {editableElementId === initiative.id ? (
                              <div>
                                {/* Dropdown for Adding Tags */}
                                <select
                                  value="" // Controlled component
                                  onChange={(e) => {
                                    const selectedTagId = e.target.value;
                                    const selectedTag = availableTags.find((tag) => tag.id === selectedTagId);

                                    if (selectedTag) {
                                      // Check if the tag is already added
                                      const currentTags = Array.isArray(tempData?.tags)
                                        ? tempData.tags
                                        : JSON.parse(tempData?.tags || "[]");

                                      const isDuplicate = currentTags.some((tag) => tag.id === selectedTag.id);

                                      if (!isDuplicate) {
                                        // Add the new tag
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

                                {/* Display Selected Tags */}
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

                        {/* Save and Cancel Buttons */}
                        <div className={styles.rowButtonsEditCancelSave}>
                          {editableElementId === initiative.id ? (
                            <>
                              <button
                                className={styles.saveElementButton}
                                onClick={() => handleSaveClick(strategy, initiative)}
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
                              onClick={() => handleEditClick(strategy, initiative)}
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
  {/* Display Radar Name and Description and What we will not do*/}
  <div className={styles.streamHeader}>
    <h1>
      {streamAggregate && streamAggregate.name ? streamAggregate.name : "Loading..."}
    </h1>
      <h2>This is about strategic thinking now</h2>
  </div>
</div>

      <div className= {styles.container}>
      <button
        className={styles.createStrategyButtonStyle}
        onClick={() => setShowCreateStrategyForm(true)}
      >
        Create Strategy
      </button>

      {showCreateStrategyForm && (
        <form className={styles.formStyle} onSubmit={handleCreateStrategySubmit}>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}> 
            <button type="submit" className = {styles.editButtonStyle}>
              Create
            </button>
            <button type="button" onClick={handleCancelCreateStrategy} className = {styles.editButtonStyle}>
              Cancel
            </button>
          </div> 
        </form>
      )}

      {showCreateInitiativeForm && targetStrategy && (
        <form className={styles.formStyle} onSubmit={(e) => handleCreateInitiative(e)}>
          {/* Display the strategy name dynamically */}
          <h3>For {targetStrategy.name} : Add a new Initiative that is value creation driven:</h3>

          {/* Input for Element Name */}
          <input
            type="text"
            name="name"
            value={newElement.name}
            onChange={(e) => handleCreateElementChange(e)}
            placeholder="Name"
            required
          />

          {/* Textarea for Element Description */}
          <textarea
            name="description"
            value={newElement.description}
            onChange={(e) => handleCreateElementChange(e)}
            placeholder="Description"
            rows="3"
            required
          ></textarea>

         {/* Buttons for Submit and Cancel */}
          <div className={styles.buttonContainerStyle}>
            <button type="submit" className={styles.saveButton}>
              Create
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => handleCancelCreateElement()}
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