import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function StrategyStream() {
  const router = useRouter();

  const streamid = Object.keys(router.query)[0];
  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editableElementId, setEditableElementId] = useState(null);

  const [showCreateStrategyForm, setShowCreateStrategyForm] = useState(false);
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    description: '',
    whatWeWillNotDo: '',
  });

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
        const response = await fetch(`/api/readmodel-strategies?streamid=${streamid}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const data = await response.json();
        setStreamData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStreamData();
  }, [router.isReady, streamid]);

  const organizeData = (data) => {
    const strategies = {};
    data.data.forEach(item => {
      if (item.type === "STRATEGY") {
        strategies[item.id] = { ...item, elements: [] };
      } else if (item.type === "STRATEGIC_ELEMENT") {
        if (strategies[item.strategy_id]) {
          strategies[item.strategy_id].elements.push(item);
        }
      }
    });
    return Object.values(strategies);
  };

  const handleElementExpand = (elementId) => {
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
        data: [...prev.data, data], // Append the new strategy to the streamData
      }));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

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
  

  const renderStrategies = (strategies) => {
    
    return strategies.map((strategy) => (
      
      <div key={strategy.id} className="strategy" style={strategyStyle}>
        <div
          className="strategy-header"
          style={{
            backgroundColor: strategy.state === "Open" ? '#28a745' : "Gainsboro", // Dynamically set the background color
            color: strategy.state === "Open" ? "white" : "black",
            ...strategyHeaderStyle, // Keep existing styles
          }}
          onClick={() => {
            console.log("HTML renderStrategies: ", strategy);
            const elementsDiv = document.getElementById(`elements-${strategy.id}`);
            elementsDiv.style.display = elementsDiv.style.display === "none" ? "block" : "none";
          }}
        >
          <span style={strategyTitleStyle}>{`${strategy.name} (Status: ${strategy.state})`}</span>
        </div>
        <div id={`elements-${strategy.id}`} className="elements" style={elementsStyle}>
          {strategy.elements.map((element) => (
            <div key={element.id} className="element" style={elementStyle}>
              {/* Element Header */}
              <div
                className="element-header"
                style={{
                  ...elementHeaderStyle, // Keep existing styles
                  backgroundColor: strategy.state === "Open" ? '#17a2b8' : "Gainsboro", // Dynamically set the background color
                }}
                onClick={() => handleElementExpand(element.id)}
              >
                {/* Display the element name instead of ID */}
                <span style={elementTitleStyle}>
                {`${element.name} (Status: ${element.state})`}
                </span>
              </div>
  
              {/* Expanded Element Details */}
              {expandedElementId === element.id && (
                <div className="element-details" style={elementDetailsStyle}>
                  {/* Name Field */}
                  <label>
                    Name:
                    <input
                      type="text"
                      value={element.name || ''}
                      onChange={(e) => handleFieldChange(element.id, 'name', e.target.value)}
                      disabled={editableElementId !== element.id}
                      style={editableElementId === element.id ? editableStyle : cellStyle}
                    />
                  </label>
  
                  {/* Description Field */}
                  <label>
                    Description:
                    <textarea
                      value={element.description || ''}
                      onChange={(e) => handleFieldChange(element.id, 'description', e.target.value)}
                      disabled={editableElementId !== element.id}
                      style={editableElementId === element.id ? editableStyle : cellStyle}
                    />
                  </label>
  
                      {/* Add the Edit Button Here */}
                      <button
                    style={editButtonStyle}
                    onClick={() => handleEditToggle(element.id)}
                  >
                    {editableElementId === element.id ? "Save" : "Edit"}
                  </button>

                  {/* Existing Table Fields */}
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
                        <td
                          contentEditable={editableElementId === element.id}
                          onInput={(e) =>
                            handleFieldChange(element.id, 'diagnosis', e.target.innerText)
                          }
                          style={editableElementId === element.id ? editableStyle : cellStyle}
                        >
                          {element.diagnosis || "N/A"}
                        </td>
                        <td
                          contentEditable={editableElementId === element.id}
                          onInput={(e) =>
                            handleFieldChange(element.id, 'overall_approach', e.target.innerText)
                          }
                          style={editableElementId === element.id ? editableStyle : cellStyle}
                        >
                          {element.overall_approach || "N/A"}
                        </td>
                        <td
                          contentEditable={editableElementId === element.id}
                          onInput={(e) =>
                            handleFieldChange(element.id, 'set_of_coherent_actions', e.target.innerText)
                          }
                          style={editableElementId === element.id ? editableStyle : cellStyle}
                        >
                          {element.set_of_coherent_actions || "N/A"}
                        </td>
                        <td
                          contentEditable={editableElementId === element.id}
                          onInput={(e) =>
                            handleFieldChange(element.id, 'proximate_objectives', e.target.innerText)
                          }
                          style={{
                            ...editableElementId === element.id ? editableStyle : cellStyle,
                            direction: "ltr", // Ensure proper LTR behavior
                          }}
                        >
                          {element.proximate_objectives || "N/A"}
                        </td>
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
      <p>Stream ID: {streamid}</p>

      <button style={createStrategyButtonStyle} onClick={() => setShowCreateStrategyForm(true)}>
        Create Strategy
      </button>
      <button style={createElementButtonStyle} onClick={() => setShowCreateElementForm(true)}>
        Create a New Strategy Element
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
      {streamData && (
        <div>
          <h2>Stream Details</h2>
          {renderStrategies(organizeData(streamData))}
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
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '20px',
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
    marginLeft: '20px',
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
    backgroundColor: "FloralWhite",
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
  };

  const elementTitleStyle = {
    color: '#ffffff', // Blue for "STRATEGIC ELEMENT"
  };

  const elementDetailsStyle = {
    marginTop: '10px',
    marginLeft: '20px',
    padding: '10px',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px',
  };

  const editButtonStyle = {
    marginLeft: '200px',
    padding: '5px 10px',
    fontSize: '14px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  };

  const createButtonStyle = {
    color: 'blue',
  }

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '10px',
  };

  const headerCellStyle = {
    backgroundColor: '#004085',
    color: 'white',
    padding: '8px',
    textAlign: 'left',
    border: '1px solid #004085',
  };

  const cellStyle = {
    padding: '8px',
    border: '1px solid #004085',
    verticalAlign: 'top',
  };

  const editableStyle = {
    backgroundColor: '#fff7e6',
    border: '1px dashed #ffa500',
  };

  const tagsStyle = {
    marginTop: '15px',
    fontSize: '14px',
    fontStyle: 'italic',
    color: '#555',
  };

  const createElementButtonStyle = {
  margin: '20px 10px',
  padding: '10px 15px',
  fontSize: '16px',
  backgroundColor: '#17a2b8',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};