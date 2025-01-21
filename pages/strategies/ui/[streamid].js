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

  const handleEditClick = async (strategy,element) => {
    setEditableElementId(element.id);

    // Save the original data of the row being edited
    console.log ("handleEditClick ", strategy);
    console.log ("handleEditClick ", element.id);
    const currentRow = element
    console.log ("handleEditClick currentRow", currentRow);
    setTempData({ ...currentRow });

      // Fetch available tags when entering edit mode
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
    
        console.log("get radar items", response.text);
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

  const [showCreateElementForm, setShowCreateElementForm] = useState(false);

  const [newElement, setNewElement] = useState({
    name: '',
    description: '',
  });

      
  const fetchStreamData = async () => {
    try {
      setLoading(true);

      // Fetch aggregate data and stream data in one go if needed
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
        } else if (item.type === "STRATEGIC_ELEMENT") {
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

  const handleElementExpand = (elementId) => {
    console.log("handleElementExpand - 1");
    setExpandedElementId(expandedElementId === elementId ? null : elementId);
  };

  const toggleStrategyCollapse = (strategyId) => {
    setCollapsedStrategies((prev) => ({
      ...prev,
      [strategyId]: !prev[strategyId], // Toggle the collapse state
    }));
  };

  const handleEditToggle = async (elementId) => {
    if (editableElementId === elementId) {
      // Save the changes
      const element = streamData.find((item) => item.id === elementId); // Find the edited element
      if (element) {
        try {
          const response = await fetch(`/api/strategy-items?elementid=${elementId}`, {
            method: 'PUT', // Or POST depending on your backend
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stream_id: element.stream_id,
              strategy_id: element.strategy_id,
              diagnosis: element.diagnosis,
              overall_approach: element.overall_approach,
              set_of_coherent_actions: element.set_of_coherent_actions,
              proximate_objectives: element.proximate_objectives,
              name: element.name,
              description: element.description,
              tags: element.tags,
            }),
          });
  
          if (!response.ok) {
            throw new Error('Failed to save changes');
          }
  
          alert('Changes saved successfully!');
        } catch (err) {
          alert(`Error: ${err.message}`);
        }
      }
      setEditableElementId(null); // Exit edit mode
    } else {
      setEditableElementId(elementId); // Enter edit mode
    }
  };  

  const handleSaveClick = async (strategy, element) => {
    if (!editableElementId || !tempData) {
      alert("No changes to save or invalid element.");
      return;
    }
  
    try {
      // Step 1: Make the API call to update the backend
      const response = await fetch(`/api/strategy-items?elementid=${editableElementId}`, {
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
                el.id === element.id ? { ...tempData } : el
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

  const handleCreateElementSubmit = async (e) => {
    e.preventDefault();

    if (!targetStrategy) {
      console.error("No target strategy selected for creating an element.");
      return;
    }
   
    try {
      const response = await fetch(`/api/strategy-items`, {
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
        throw new Error('Failed to create strategy element');
      }

      const data = await response.json();
      alert('Strategy element created successfully!');
      console.log("Optimistic UI with data", data);
      console.log("Optimistic UI with prev.data", streamData);
      setShowCreateElementForm(false);
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
        name: eventData.result.name,
        description: eventData.result.description,
        state: eventData.result.state,
        stream_id: eventData.result.stream_id,
        id: eventData.result.id,
        whatwewillnotdo: eventData.result.whatwewillnotdo,
        elements: [], 
      };
      setShowCreateStrategyForm(false);
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
    setShowCreateElementForm(false); 
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
            <span style={strategyTitleStyle}>{`${strategy.name} (${strategy.state})`}</span>
          </div>
          
           {/* Add Element Button */}
        {collapsedStrategies[strategy.id] && (
          <div className={styles.addElementContainer}>
            <button
              className={styles.createElementButtonStyle}
              
              onClick={() => {
                setTargetStrategy(strategy); // Track the strategy ID
                console.log("setTargetStrategy(strategy)", strategy);
                setShowCreateElementForm(true);  // Show the form
              }}
            >
              Add Element
            </button>
          </div>
        )}

        {/* Show elements only if the strategy is collapsed */}
        {collapsedStrategies[strategy.id] && (
          <div id={`elements-${strategy.id}`} className="elements" style={elementsStyle}>
            {strategy.elements.map((element) => (
              <div key={element.id} className={styles.element} style={elementStyle}>
                <span>{element.name}</span>
              </div>
            ))}
          </div>
        )}

              <div id={`elements-${strategy.id}`} className="elements" style={elementsStyle}>
                {strategy.elements.map((element) => (
                  <div key={element.id} className="element" style={elementStyle}>
                    <div
                      className="elementHeader"
                      style={{
                        ...elementHeaderStyle,
                        backgroundColor: strategy.state !== "Closed" ? "Plum" : "Gainsboro",
                      }}
                      onClick={() => handleElementExpand(element.id)}
                    >
                      <span style={elementTitleStyle}>{`${element.name} (${element.state})`}</span>
                    </div>
                       
                    {expandedElementId === element.id && (
                      <div className="element-details" style={elementDetailsStyle}>
                        {/* Name Field */}
                        <div className={styles.horizontalAlignmentWrapper}>
                          <label className={styles.labelElementStyle}>
                            Name
                            <textarea
                              value={tempData?.name || element.name || ""}
                              onChange={(e) => handleFieldChange("name", e.target.value)}
                              disabled={editableElementId !== element.id}
                              className={
                                editableElementId === element.id
                                  ? `${styles.textAreaName} ${styles.textAreaNameEditable}`
                                  : styles.textAreaName
                              }
                            />
                          </label>
    
                          <label className={styles.labelElementStyle}>
                            Description
                            <textarea
                              value={tempData?.description || element.description || ""}
                              onChange={(e) => handleFieldChange("description", e.target.value)}
                              disabled={editableElementId !== element.id}
                              className={
                                editableElementId === element.id
                                  ? `${styles.textAreaDescription} ${styles.textAreaDescriptionEditable}`
                                  : styles.textAreaDescription
                              }
                            />
                          </label>
                        </div>
    
                        {/* Table Fields */}
                        <table className={styles.tableStyle}>
                          <thead>
                            <tr>
                              <th id="diagnosis" className={styles.headerCells}>Diagnosis</th>
                              <th id="overallApproach" className={styles.headerCells}>Overall Approach</th>
                              <th id="coherentActions" className={styles.headerCells}>Set of Coherent Actions</th>
                              <th id="proximateObjectives" className={styles.headerCells}>Proximate Objectives</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              {["diagnosis", "overall_approach", "set_of_coherent_actions", "proximate_objectives"].map((field) => (
                                <td
                                  key={field}
                                  className={
                                    editableElementId === element.id
                                      ? `${styles.tableCell} ${styles.tableCellEditable}`
                                      : styles.tableCell
                                  }
                                >
                                  {editableElementId === element.id ? (
                                    <textarea
                                      value={tempData[field] || ""}
                                      onChange={(e) => handleFieldChange(field, e.target.value)}
                                      className={styles.textArea}
                                      autoFocus
                                    />
                                  ) : (
                                    element[field] || "N/A"
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
                              We need facts and data. Be very mindful of biases like the echo chamber.<br />
                              Be careful of logical arguments.<br />
                              Tools such as Wardley mapping can be used here.
                            </span>
                          }
                          className={styles.customTooltip}
                        />
                        {/* Repeat tooltips for other columns as shown above */}
    
                        {/* Tags Field */}
                        <div className={styles.tagsContainer}>
                          <strong>Tags</strong>
                          <div>
                            {editableElementId === element.id ? (
                              <div>
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
                                {element.tags ? (
                                  Array.isArray(element.tags)
                                    ? element.tags.map((tag, index) => (
                                        <span key={index} className={styles.tagReadonly}>
                                          {tag.name}
                                        </span>
                                      ))
                                    : JSON.parse(element.tags).map((tag, index) => (
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
                          {editableElementId === element.id ? (
                            <>
                              <button
                                className={styles.saveButton}
                                onClick={() => handleSaveClick(strategy, element)}
                              >
                                Save
                              </button>
                              <button className={styles.saveButton} onClick={handleCancelClick}>
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              className={styles.editButton}
                              onClick={() => handleEditClick(strategy, element)}
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
        <form style={formStyle} onSubmit={handleCreateStrategySubmit}>
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

      {showCreateElementForm && targetStrategy && (
        <form style={formStyle} onSubmit={(e) => handleCreateElementSubmit(e)}>
          {/* Display the strategy name dynamically */}
          <h3>Add Element to {targetStrategy.name}</h3>

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



// Add your styles here

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '0px',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
    width: '400px',
    margin: '20px auto',
  };
  
 
  const elementsStyle = {
    display: 'none',
    marginLeft: '10px',
    marginTop: '10px',
  };

  const strategyTitleStyle = {
    color: '#ffffff', // Dark blue for "STRATEGY"
  };

  const elementStyle = {
    padding: '8px',
    backgroundColor: '#fafafa',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '5px',
  };

  const elementHeaderStyle = {
    fontSize: '16px',
    fontWeight: 'normal',
    backgroundColor: "Lavender",
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'black',
  };

  const elementTitleStyle = {
    color: '#ffffff', // Blue for "STRATEGIC ELEMENT"
  };

  const elementDetailsStyle = {
    marginTop: '10px',
    marginLeft: '0px',
    padding: '10px',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
  };


  const editButtonStyle = {
    marginLeft: '200px',
    padding: '5px 10px',
    fontSize: '14px',
    backgroundColor: 'Purple',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  };