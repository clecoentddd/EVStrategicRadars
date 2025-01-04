import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './streamid.module.css';
import Navbar from "./navbar"; 
import { EXPORT_DETAIL } from 'next/dist/shared/lib/constants';
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
    whatWeWillNotDo: '',
  });

  const [availableTags, setAvailableTags] = useState([]); // Tags fetched from API

  const handleEditClick = async (id) => {
    setEditableElementId(id);

    // Save the original data of the row being edited
    const currentRow = streamData.data.find((item) => item.id === id);
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

  useEffect(() => {
    if (!router.isReady) return;

    
    const fetchStreamData = async () => {
      try {
        setLoading(true);

        // Fetch aggregate data and stream data in one go if needed
        const aggregateResponse = await fetch(`/api/readmodel-strategies?stream_aggregate=${streamid}`);
        if (!aggregateResponse.ok) {
          throw new Error(`Failed to fetch aggregate data: ${aggregateResponse.statusText}`);
        }
        const aggregateStream= await aggregateResponse.json();

        console.log ("Stream Aggregate id fetched is", aggregateStream.radarId);
        console.log ("Stream Aggregate name fetched is", aggregateStream.name);

        // Extract radarId from aggregate data
        setStreamAggregate(aggregateStream || null);

        // Fetch stream data if needed
        const streamResponse = await fetch(`/api/readmodel-strategies?stream_id=${streamid}`);
        if (!streamResponse.ok) {
          throw new Error(`Failed to fetch stream data: ${streamResponse.statusText}`);
        }
        const streamData = await streamResponse.json();
        setStreamData(streamData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

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

  const organizeData = (streamData) => {
    const strategies = {};
    
  
    streamData?.data.forEach(item => {
      if (item.type === "STRATEGY") {
        strategies[item.id] = { ...item, elements: [] };
      } else if (item.type === "STRATEGIC_ELEMENT") {
        if (strategies[item.strategy_id]) {
          strategies[item.strategy_id].elements.push(item);
        }
      }
    });

    return Object.values(strategies); // Returning the organized strategies
  };


    // Organize data when streamData is updated
    useEffect(() => {
      if (streamData && streamData.data && Array.isArray(streamData.data)) {
        const organizedStrategies = organizeData(streamData);
        console.log(organizedStrategies); // Do something with the organized data
      } else
      {
        console.log("No strategies defined yet."); 
      }
    }, [streamData]);

  const handleElementExpand = (elementId) => {
    console.log("handleElementExpand - 1");
    setExpandedElementId(expandedElementId === elementId ? null : elementId);
  };

  const handleEditToggle = async (elementId) => {
    if (editableElementId === elementId) {
      // Save the changes
      const element = streamData.data.find((item) => item.id === elementId); // Find the edited element
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

  const handleSaveClick = async () => {
    if (editableElementId && tempData) {
      // Create updatedData outside of setStreamData
      const updatedData = streamData.data.map((item) =>
        item.id === editableElementId ? { ...tempData } : item
      );
  
      // Update state with updatedData
      setStreamData((prevData) => ({
        ...prevData,
        data: updatedData,
      }));
  
      // Make the API call using updatedData
      try {
        const response = await fetch(`/api/strategy-items?elementid=${editableElementId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
          throw new Error('Failed to save changes');
        }
  
        alert('Changes saved successfully!');
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
  
      // Exit edit mode and clear temporary data
      setEditableElementId(null);
      setTempData(null);
    }
  };
    
  const handleTagSelect = (selectedTag) => {
      // Check if element.tags is a string and parse it if it is
      const element = streamData.data.find((item) => item.id === editableElementId); // Get the current element

      console.log("Selected tags are:", selectedTag);
      const existingTags = 
        element.tags && 
        typeof element.tags === 'string' && 
        element.tags.trim() !== '' 
          ? JSON.parse(element.tags) 
          : []; 
  
    // Check if the selected tag already exists
    const existingTagIndex = existingTags.findIndex((tag) => tag.id === selectedTag.id);
  
    if (existingTagIndex === -1) { 
      // If the tag doesn't exist, add it to the array
      existingTags.push(selectedTag); 
    }
  
    // Update the state with the new tags
    setTempData({ 
      ...tempData, 
      tags: JSON.stringify(existingTags) 
    });
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
    const openStrategy = streamData?.data.find(item => item.type === 'STRATEGY' && item.state === "Open");
    if (!openStrategy) {
      alert('No open strategy found to add an element to.');
      return;
    }

    try {
      const response = await fetch(`/api/strategy-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stream_id: streamid,
          strategy_id: openStrategy.id, // Pass the open strategy ID
          name: newElement.name,
          description: newElement.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create strategy element');
      }

      const data = await response.json();
      alert('Strategy element created successfully!');
      setShowCreateElementForm(false);
      setNewElement({ name: '', description: '' });
      setStreamData((prev) => ({
        ...prev,
        data: [...prev.data, data],
      }));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCreateElementChange = (e) => {
    const { name, value } = e.target;
    setNewElement((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateStrategySubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`/api/strategy-version`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stream_id: streamid,
              name: newStrategy.name,
              description: newStrategy.description,
              // whatWeWillNotDo: newStrategy.whatWeWillNotDo,
            }),
          });

      if (!response.ok) {
        throw new Error('Failed to create strategy', response.statutsText);
      }

      const data = await response.json();
      alert('Strategy created successfully!');
      setShowCreateStrategyForm(false);
      setNewStrategy({ name: '', description: '', whatWeWillNotDo: '' });
      setStreamData((prev) => ({
        ...prev,
        data: prev.data ? [...prev.data, data] : [data], // Conditionally use spread
      }));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCancelCreateElement = () => {
    // Reset the newElement state
    setNewElement({ 
      name: '', 
      description: '' 
    }); 
    // Optionally, close the form (if it's in a modal or overlay)
    setShowCreateElementForm(false); 
  };

  
  const renderStrategies = (strategies) => {
    return strategies.map((strategy) => (
      <div key={strategy.id} className="strategy" style={strategyStyle}>
        <div
          className="strategy-header"
          style={{
            backgroundColor: strategy.state === "Open" ? "Purple" : "Gainsboro",
            color: strategy.state === "Open" ? "white" : "black",
            ...strategyHeaderStyle,
          }}
          onClick={() => {
            const elementsDiv = document.getElementById(`elements-${strategy.id}`);
            elementsDiv.style.display = elementsDiv.style.display === "none" ? "block" : "none";
          }}
        >
          <span style={strategyTitleStyle}>{`${strategy.name} (${strategy.state})`}</span>
        </div>
        <div id={`elements-${strategy.id}`} className="elements" style={elementsStyle}>
          {strategy.elements.map((element) => (
            <div key={element.id} className="element" style={elementStyle}>
              <div
                className="element-header"
                style={{
                  ...elementHeaderStyle,
                  backgroundColor: strategy.state === "Open" ? "Plum" : "Gainsboro",
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

                  {/* Define tooltips for the header elements */}
                  <ReactTooltip anchorId="diagnosis" place="top" content={<span>We need facts and data. Be very mindful of biases like the echo chamber.<br />Be careful of logical arguments.<br />Tools such as Wardley mapping can be used here</span>} className={styles.customTooltip}/>
                  <ReactTooltip anchorId="overallApproach" place="top" content={<span>How you are going to solve the problem and take advantage of the opportinuty.<br />This is seen as the strategy but do not be fooled: strategy is more than an approach</span>} className={styles.customTooltip} />
                  <ReactTooltip anchorId="coherentActions" place="top" content={<span>Ensure you have a set of coherent actions</span>} className={styles.customTooltip}/>
                  <ReactTooltip anchorId="proximateObjectives" place="top" content={<span>You want to make your strategy concrete, executable in the very short-term so people can believe you are walking the talk</span>} className={styles.customTooltip}/>
                  
                  
                  {/* Tags Field (Below Table) */}

                  <div className={styles.tagsContainer}>
                    <strong>Tags</strong>
                    <div>
                      {editableElementId === element.id ? (
                        // Editable mode: Display existing tags with the option to delete
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
                                    // Remove only the selected tag
                                    const updatedTags = (Array.isArray(tempData?.tags)
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
                          <select
                            disabled={editableElementId !== element.id}
                            multiple
                            className={styles.tagsDropdown}
                            value={
                              Array.isArray(tempData?.tags)
                                ? tempData.tags.map((tag) => tag.id)
                                : tempData?.tags?.length > 0
                                ? JSON.parse(tempData?.tags).map((tag) => tag.id)
                                : []
                            }
                            onChange={(e) => {
                              // Get selected tag IDs
                              const selectedTagIds = Array.from(e.target.selectedOptions).map(
                                (option) => option.value
                              );

                              // Map selected IDs to tag objects
                              const selectedTags = availableTags.filter((tag) =>
                                selectedTagIds.includes(tag.id)
                              );

                              // Combine existing tags with newly selected tags, avoiding duplicates
                              const combinedTags = [
                                ...(Array.isArray(tempData?.tags)
                                  ? tempData.tags
                                  : JSON.parse(tempData?.tags || "[]")),
                                ...selectedTags,
                              ];

                              const uniqueTags = combinedTags.reduce((acc, tag) => {
                                if (!acc.some((t) => t.id === tag.id)) {
                                  acc.push(tag);
                                }
                                return acc;
                              }, []);

                              setTempData((prev) => ({
                                ...prev,
                                tags: uniqueTags,
                              }));
                            }}
                          >
                            <option value="" disabled>
                              Select a tag
                            </option>
                            {availableTags.map(({ name, id }) => (
                              <option key={id} value={id}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        // Read-only mode: Display tags as a comma-separated string
                        <div>
                          {element.tags && (
                            <div className={styles.tagsReadonlyContainer}>
                              {Array.isArray(element.tags)
                                ? element.tags.map((tag, index) => (
                                    <span key={index} className={styles.tagReadonly}>
                                      {tag.name}
                                    </span>
                                  ))
                                : JSON.parse(element.tags).map((tag, index) => (
                                    <span key={index} className={styles.tagReadonly}>
                                      {tag.name}
                                    </span>
                                  ))}
                            </div>
                          )}

                          {(!element.tags ||
                            (Array.isArray(element.tags) && element.tags.length === 0) ||
                            (typeof element.tags === "string" &&
                              JSON.parse(element.tags).length === 0)) && <span>No tags</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.rowButtonsEditCancelSave}>
                    {/* Edit Button */}
                    {editableElementId === element.id ? (
                    <>
                    <button className={styles.saveButton} onClick={handleSaveClick}>Save</button>
                    <button className={styles.cancelButton} onClick={handleCancelClick}>Cancel</button>
                    </>
                    ) : (
                    <button className={styles.editButton} onClick={() => handleEditClick(element.id)}>Edit</button>
                    )}
                  </div>
                  </div>
              )}
            </div>
          ))}
        </div>
      </div>
    ));
  };

return (
  <>
    <div>
      <Navbar getRadarUrl={getRadarUrl} streamAggregate={streamAggregate} />
    </div>

    <div className={styles.container}>
  {/* Display Radar Name and Description */}
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
      <button
        className={styles.createStrategyButtonStyle}
        onClick={() => setShowCreateElementForm(true)}
      >
        Create a Strategy Element
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
            name="whatWeWillNotDo"
            value={newStrategy.whatWeWillNotDo}
            onChange={handleCreateStrategyChange}
            placeholder="What we will not do"
            rows="3"
          ></textarea>
          <button type="submit" style={editButtonStyle}>
            Create
          </button>
        </form>
      )}

      {showCreateElementForm && (
        <form style={formStyle} onSubmit={handleCreateElementSubmit}>
          <h3>Create Strategy Element</h3>
          <input
            type="text"
            name="name"
            value={newElement.name}
            onChange={handleCreateElementChange}
            placeholder="Name"
            required
          />
          <textarea
            name="description"
            value={newElement.description}
            onChange={handleCreateElementChange}
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
              onClick={handleCancelCreateElement}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && <p>Loading stream data...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {streamData && streamData.data && Array.isArray(streamData.data) ? (
        <div>
          <h2>Stream Details</h2>
          {renderStrategies(organizeData(streamData))}
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
  
  const strategyStyle = {
    marginBottom: '20px',
  };

  const strategyHeaderStyle = {
    color: 'white', // Adjust text color for readability
    padding: '10px',
    cursor: 'pointer',
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
