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

  const [showCreateStrategyForm, setShowCreateStrategyForm] = useState(false);
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    description: '',
    whatWeWillNotDo: '',
  });

  const [columnContent, setColumnContent] = useState('This is the content for the fourth column.'); 

  const handleFieldChange = (elementId, fieldName, value) => {
    setStreamData((prevData) => {
      const updatedData = prevData.data.map((item) => {
        if (item.id === elementId) {
          // Update the specific field
          return {
            ...item,
            [fieldName]: fieldName === 'tags'
              ? JSON.stringify(value.split(',').map(tag => tag.trim())) // Handle tags as JSON
              : value,
          };
        }
        return item; // Leave other elements unchanged
      });
  
      return { ...prevData, data: updatedData }; // Return updated state
    });
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
                    Name:
                    <input
                      type="text"
                      value={element.name || ""}
                      onChange={(e) => handleFieldChange(element.id, "name", e.target.value)}
                      disabled={editableElementId !== element.id}
                      style={editableElementId === element.id ? editableStyle : cellStyle}
                    />
                  </label>
  
                  {/* Description Field */}
                  <label>
                    Description:
                    <textarea
                      value={element.description || ""}
                      onChange={(e) => handleFieldChange(element.id, "description", e.target.value)}
                      disabled={editableElementId !== element.id}
                      style={editableElementId === element.id ? editableStyle : cellStyle}
                    />
                  </label>
  
                  {/* Edit Button */}
                  <button
                    style={editButtonStyle}
                    onClick={() => handleEditToggle(element.id)}
                  >
                    {editableElementId === element.id ? "Save" : "Edit"}
                  </button>
  
                  {/* Table Fields */}
                  <table style={tableStyle}>
  <thead>
    <tr>
      <th style={headerCellStyle}>Diagnosis</th>
      <th style={headerCellStyle}>Overall Approach</th>
      <th style={headerCellStyle}>Set of Coherent Actions</th>
      <th style={headerCellStyle}>Proximate Objectives</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      {["diagnosis", "overall_approach", "set_of_coherent_actions", "proximate_objectives"].map((field) => (
        <td
          key={field}
          style={
            editableElementId === element.id
              ? { ...cellStyle, ...editableStyle } // Merge common cell styles with editable-specific styles
              : cellStyle
          }
        >
          {editableElementId === element.id ? (
            <textarea
              value={element[field] || ""}
              onChange={(e) => handleFieldChange(element.id, field, e.target.value)}
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

                  {/* Tags Field (Below Table) */}
                  <div style={tagsStyle}>
                    <strong>Tags:</strong>
                    <input
                      type="text"
                      value={element.tags ? JSON.parse(element.tags).join(', ') : ''}
                      onChange={(e) => handleFieldChange(element.id, 'tags', e.target.value)}
                      disabled={editableElementId !== element.id}
                      style={editableElementId === element.id ? editableStyle : cellStyle}
                    />
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
            Save
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
            Save
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

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '10px',
    marginTop: '10px',
      };

  const headerCellStyle = {
    backgroundColor: 'Thistle',
    color: 'white',
    padding: '8px',
    textAlign: 'left',
    border: '1px solidrgb(187, 95, 201)',
  };

  const cellStyle = {
    padding: '8px',
    border: '1px solidrgb(173, 110, 160)',
    verticalAlign: 'top',
    tableLayout: 'fixed',
  };

  const editableStyle = {
    padding: '8px',
    backgroundColor: 'Lavender',
    border: '1px dashedrgb(198, 97, 168)',
    tableLayout: 'fixed',
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

