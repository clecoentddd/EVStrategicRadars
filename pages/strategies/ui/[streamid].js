import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './streamid.module.css';

export default function StrategyStream() {
  const router = useRouter();

  const streamid = Object.keys(router.query)[0];
  const [streamData, setStreamData] = useState({
    data: [], // Initialize data as an empty array
  });
  const [ streamAggregate, setStreamAggregate] = useState(null);
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
  const [selectedTags, setSelectedTags] = useState([]);  // Tags selected by the user

  const [radarItems, setRadarItems] = useState([]); 
  const [selectedRadarItemId, setSelectedRadarItemId] = useState('')
  

  const handleEditClick = async (id) => {
    setEditableElementId(id);

    // Save the original data of the row being edited
    const currentRow = streamData.data.find((item) => item.id === id);
    setTempData({ ...currentRow });

      // Fetch available tags when entering edit mode
      try {
        const response = await fetch(`/api/radar-items?radar_id=${id}`, {
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

  async  function viewRadar(name, aggregateId) {
    // Navigate to the radar details page with the name and id as query parameters
    console.log( "View Radar ", streamAggregate.radar_id);
    const radarPage = `/radars/ui/${encodeURIComponent(name)}?radar_id=${encodeURIComponent(aggregateId)}`;
    window.open(radarPage, '_blank');
  }
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

        console.log ("Stream Aggregate id fetched is", aggregateStream.radar_id);
        console.log ("Stream Aggregate name fetched is", aggregateStream.name);

        // Extract radar_id from aggregate data
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
                  <label style={labelElementStyle}>
                    Name
                    <input
                      type="text"
                      value={tempData?.name || element.name || ""}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      disabled={editableElementId !== element.id}
                      className={
                        editableElementId === element.id
                          ? `${styles.nameCell} ${styles.nameCellEditable}` // Editable-specific styles
                          : styles.nameCell // Default cell styles
                      }
                    />
                  </label>

                  {/* Description Field */}
                  <label>
                    Description
                    <textarea
                      value={tempData?.description || element.description || ""}
                      onChange={(e) => handleFieldChange("description", e.target.value)}
                      disabled={editableElementId !== element.id}
                      className={
                        editableElementId === element.id
                          ? `${styles.descriptionCell} ${styles.descriptionCellEditable}` // Editable-specific styles
                          : styles.descriptionCell // Default cell styles
                      }
                    />
                  </label>
   
                  {/* Table Fields */}
                  <table className={styles.tableStyle}>
                    <thead>
                      <tr>
                        <th className={styles.headerCells}>Diagnosis</th>
                        <th className={styles.headerCells}>Overall Approach</th>
                        <th className={styles.headerCells}>Set of Coherent Actions</th>
                        <th className={styles.headerCells}>Proximate Objectives</th>
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
                                : styles.tableCell // Default cell class
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
                  </table
                  >
                  {/* Tags Field (Below Table) */}
          
{/* Tags Field (Below Table) */}

<div style={tagsStyle}>
  <strong>Tags</strong>

  <div> {/* Outer div for consistent styling */}
    {editableElementId === element.id ? (
      // Editable mode: Dropdown to select tags
      <select
        disabled={editableElementId !== element.id}
        multiple
        //value={element.tags?.map((tag) => tag.id) || []} 
        onChange={(e) => {
          const selectedTagIds = Array.from(e.target.selectedOptions).map((option) => option.value);
          const selectedTags = availableTags.filter((tag) => selectedTagIds.includes(tag.id));
          handleTagSelect(selectedTags); 
        }}
      >
        <option value="">Select a tag</option>
        {availableTags.map(({ name, id }) => ( 
          <option key={id} value={id}>
            {name} 
          </option>
        ))}
      </select>
    ) : (
      // Read-only mode: Display tags as a comma-separated string
      <span>
        {element.tags && 
          typeof element.tags === 'string' && 
          <span>
            {JSON.parse(element.tags) 
              .map((tag) => `${tag.name} (${tag.id}), `) 
              .join("")} 
          </span>
        }
        {(!element.tags || 
          typeof element.tags !== 'string' || 
          element.tags.trim() === '') && (
            <span>No tags</span>
          )
        }
      </span>
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
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      <h1>Strategy Stream</h1>
      <p>Stream name: {streamAggregate ? streamAggregate.name : "Loading..."}</p>

                
      <button style={createStrategyButtonStyle} onClick={() => setShowCreateStrategyForm(true)}>
        Create Strategy
      </button>
      <button style={createElementButtonStyle} onClick={() => setShowCreateElementForm(true)}>
        Create a Strategy Element
      </button>
      {streamData && streamData.data && streamAggregate && (
        <button 
        className="button" 
        onClick={() => {
          if (streamAggregate) { 
            viewRadar(streamAggregate.name, streamAggregate.radar_id); 
          } else {
            console.error("streamAggregate is undefined"); 
          }
        }} 
        style={radarLinkButtonStyle}
      >
        View radar
      </button>
      )}



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
          <button type="submit" style={editButtonStyle}>
            Create
          </button>
        </form>
      )}

      {loading && <p>Loading stream data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {streamData && streamData.data && Array.isArray(streamData.data) ? (
      <div>
        <h2>Stream Details</h2>
        {renderStrategies(organizeData(streamData))} 
      </div>
    ) : (
      <div style={{ color: 'red' }}>
        No strategies defined yet.
      </div>
    )}

    </div>
  );
}


// Add your styles here

const createStrategyButtonStyle = {
    margin: '20px 0',
    padding: '10px 15px',
    fontSize: '16px',
    backgroundColor: 'Purple',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  };

  const labelElementStyle = {
    margin: '20px 0px',
    padding: '10px 15px',
    marginRight: '5px',
    fontSize: '16px',
  };

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

  const radarLinkButtonStyle = {
    margin: '20px 0',
    padding: '10px 15px',
    fontSize: '16px',
    backgroundColor: '#ffffff',
    color: 'blue',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  };

  const tagsStyle = {
    marginTop: '15px',
    fontSize: '14px',
    fontStyle: 'italic',
    color: '#555',
  };

  const createElementButtonStyle = {
  margin: '10px 10px',
  padding: '10px 15px',
  fontSize: '16px',
  backgroundColor: 'Plum',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

