import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import RadarChart from '../../../components/RadarChart';


export default function RadarPage() {
  const [radar, setRadar] = useState(null);
  const [radarItems, setRadarItems] = useState([]);
  const [loadingRadar, setLoadingRadar] = useState(true);  // Loading state for radar data
  const [loadingItems, setLoadingItems] = useState(true);  // Loading state for radar items

  const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    type: '',
    distance: '',
    impact: '',
    tolerance: '',
    zoom_in: '', // This will hold the selected zoom-in radar ID
  });
  const [zoomInOptions, setZoomInOptions] = useState([]);
  const [impactOptions, setImpactOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [toleranceOptions, setToleranceOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [distanceOptions, setDistanceOptions] = useState([]);
  const [showForm, setShowForm] = useState(false); // Toggle to show/hide form
  const [editMode, setEditMode] = useState(false); // Flag to switch between create/edit mode
  const [currentEditingId, setCurrentEditingId] = useState(null); // Track the id of the item being edited
  const [logs, setLogs] = useState([]); // State to manage logs
  const router = useRouter();
  const { name, radar_id } = router.query;

  useEffect(() => {
    if (!radar_id) return;

    const fetchRadar = async () => {
      try {
        setLoadingRadar(true);
        setError(null);
        logMessage("Fetching radar data...");

        const response = await fetch(`/api/radars?aggregate_id=${radar_id}`);
        const data = await response.json();

        if (response.ok) {
          setRadar(data);
          logMessage("Radar data fetched successfully");
        } else {
          setError(data.message);
          logMessage(`Error fetching radar data: ${data.message}`);
        }
      } catch (err) {
        setError('Error fetching radar');
        logMessage("Error fetching radar data");
      } finally {
        setLoadingRadar(false); // Set loading to false after fetching radar
      }
    };

    const fetchRadarItems = async () => {
      try {
        logMessage("Fetching radar items...");
        const response = await fetch(`/api/radar_items?radar_id=${radar_id}`);
        const data = await response.json();

        if (response.ok) {
          setRadarItems(data);
          logMessage("Radar items fetched successfully");
        } else {
          setError(data.message);
          logMessage(`Error fetching radar items: ${data.message}`);
        }
      } catch (err) {
        setError('Error fetching radar items');
        logMessage("Error fetching radar items");
      } finally {
        setLoadingItems(false); // Set loading to false after fetching radar items
      }
    };

    const fetchZoomInOptions = async () => {
      try {
        const response = await fetch(`/api/radars`);
        const radars = await response.json();

        if (response.ok) {
          setZoomInOptions(radars.filter((radarItem) => radarItem.aggregate_id !== radar_id));
        }
      } catch (err) {
        setError('Error fetching radar options for zoom-in');
        logMessage("Error fetching radar options for zoom-in");
      }
    };

    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/radar_config');
        const data = await response.json();

        // Extract distance and impact options
        const distanceOptions = Object.values(data.distanceOptions);
        const impactOptions = Object.values(data.impactOptions);
        const typeOptions = Object.values(data.typeOptions);
        const categoryOptions = Object.values(data.categoryOptions);
        const toleranceOptions = Object.values(data.toleranceOptions);
        logMessage(` HTML RAW RESPONSE fetching config - Distance: ${distanceOptions}`);
        logMessage(` HTML RAW RESPONSE fetching config - Impact: ${impactOptions}`);
        logMessage(` HTML RAW RESPONSE fetching config - Tolerance: ${toleranceOptions}`);
        logMessage(` HTML RAW RESPONSE fetching config - Type: ${typeOptions}`);
        logMessage(` HTML RAW RESPONSE fetching config - Category: ${categoryOptions}`);
        
        setImpactOptions(impactOptions); // Set the fetched impact options
        setTypeOptions(typeOptions); // Set the fetched impact options
        setToleranceOptions(toleranceOptions);
        setCategoryOptions(categoryOptions);
        setDistanceOptions(distanceOptions);
        setIsLoading(false);
        
        // ... use the other data as needed
      } catch (error) {
        logMessage(` Error fetching config: ${error}`);
      }
    };
  
    // Call fetchConfig to retrieve impact options
    logMessage(`2 Impact options retrieved successfully`);
    fetchConfig();
    fetchRadar();
    fetchRadarItems();
    fetchZoomInOptions();
  }, [radar_id]);

  const logMessage = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]); // Add log message to state
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEdit = async (item) => {
    try {
      logMessage("Entering handleEdit...");
      setEditMode(true);
      setCurrentEditingId(item.aggregate_id); // Set the current editing item ID
      setShowForm(true); // Show the form for editing
  
      // Fetch the latest data for the selected aggregate
      logMessage(`Fetching radar item with aggregate_id: ${item.aggregate_id}`);
      const response = await fetch(`/api/radaritems?aggregate_id=${item.aggregate_id}`);
  
      // Log the response status
      logMessage(`Response status: ${response.status}`);
  
      if (!response.ok) {
        const errorText = await response.text(); // Get the raw error text
        setError(`Failed to fetch radar item: ${errorText}`);
        logMessage(`Failed to fetch radar item: ${errorText}`);
        return;
      }
  
      // Get the raw response text
      const rawResponseText = await response.text(); // Read response as raw text
      logMessage(`Raw Response Text: ${rawResponseText}`);
  
      // Parse the raw response text as JSON
      const radarItem = JSON.parse(rawResponseText); // Safely parse JSON from text
  
      logMessage(`Parsed Radar Item: ${JSON.stringify(radarItem)}`);
      logMessage (`radar item is : ${radarItem.name}`);
  
      // Check if the response indicates success
      if (radarItem.success === false) {
        setError(radarItem.message); // Show the message from the response
        logMessage(`Error: ${radarItem.message}`);
        return;
      }
  
      logMessage("Fetched radar item data successfully");
  
      // Populate the form with the fetched data
      setFormData({
        name: radarItem.name || '',
        description: radarItem.description || '',
        category: radarItem.category || '',
        type: radarItem.type || '',
        distance: radarItem.distance || '',
        impact: radarItem.impact || '',
        tolerance: radarItem.tolerance || '',
        zoom_in: radarItem.zoom_in || '',
      });
    } catch (error) {
      setError('Error fetching radar item for edit');
      logMessage(`Error during radar item fetch: ${error.message}`);
    }
  };

  const handleSave = async () => {
    try {
      logMessage("Entering handleSave...");
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `/api/radaritems?aggregate_id=${currentEditingId}` : `/api/radaritems`;
  
      // Wrap the data inside command.payload
      const command = {
        payload: {
          radar_id, // Include radar_id in the payload
          ...formData,
        },
      };
  
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command), // Send the command structure
      });
      logMessage(`HTML Payload being sent: ${JSON.stringify(command)}`);

      logMessage(`Error saving radar item 0: ${response.status}`);
  
      if (!response.ok) {
        const errorText = await response.text();
        logMessage(`Error saving radar item 1: ${errorText}`);
        return;
      }
  
      // Get the raw response text
      const rawResponseText = await response.text(); // Read response as raw text
      logMessage(`Raw Response Text: ${rawResponseText}`);
  
      // Parse the raw response text as JSON
      const radarItem = JSON.parse(rawResponseText); // Safely parse JSON from text
  
      logMessage(`Parsed Radar Item: ${JSON.stringify(radarItem)}`);
      logMessage (`radar item is : ${radarItem.name}`);
  
 // Update the radarItems state in both edit and save (create) modes
 setRadarItems(prevRadarItems => {
  if (editMode) {
    // Replace the updated item in the list
    return prevRadarItems.map(item =>
      item.aggregate_id === currentEditingId ? radarItem : item
    );
  } else {
    // Add the new item to the list
    return [radarItem, ...prevRadarItems];
  }
});

// Close the form and reset all states
setShowForm(false);
setEditMode(false);
setCurrentEditingId(null);
setFormData({
  name: '',
  description: '',
  category: '',
  type: '',
  distance: '',
  impact: '',
  tolerance: '',
  zoom_in: '',
});

logMessage("Radar item saved successfully");
} catch (err) {
logMessage("Error saving radar item");
}
};

  if (loadingRadar || loadingItems) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!radar) return <p>No radar found</p>;

  return (
    <div>
      <div>
      <a href="/radars.html" style={{ position: "absolute", top: "10px", left: "10px" }}>
        <button style={{ backgroundColor: "lightblue", color: "white", padding: "5px 10px", borderRadius: "5px", cursor: "pointer",border: "none" }}>
          Radars
        </button>
      </a>
      <h1> ............. Radar - {radar.name}</h1>
      </div>
      <p><strong>Aggregate ID:</strong> {radar.aggregate_id}</p>
      <p><strong>Description:</strong> {radar.description}</p>
      <p><strong>Level:</strong> {radar.org_level}</p>

      <h2>Radar Chart</h2>
      <RadarChart items={radarItems} radius={200} />

      <h2>Radar Items</h2>
      <button
        onClick={() => setShowForm(!showForm)}
        style={{ padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginBottom: "20px" }}
      >
        {showForm ? "Cancel" : "Create Radar Item"}
      </button>

      {showForm && (
        <div style={{ marginTop: '20px' }}>
          <h3>{editMode ? "Edit Radar Item" : "Create Radar Item"}</h3>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Description:
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
                Category
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="">Select Category</option>
                  {categoryOptions.length > 0 ? (
                    categoryOptions.map((option) => (
                      <option key={option._id} value={option.name}>
                        {option.label}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading options...</option>
                  )}
                </select>
              </label>
              <label>
                Distance
                <select name="distance" value={formData.distance} onChange={handleInputChange}>
                  <option value="">Select Distance</option>
                  {distanceOptions.length > 0 ? (
                    distanceOptions.map((option) => (
                      <option key={option._id} value={option.name}>
                        {option.label}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading options...</option>
                  )}
                </select>
              </label>
            <label>
                Type
                <select name="type" value={formData.type} onChange={handleInputChange}>
                  <option value="">Select Type</option>
                  {typeOptions.length > 0 ? (
                    typeOptions.map((option) => (
                      <option key={option._id} value={option.name}>
                        {option.label}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading options...</option>
                  )}
                </select>
              </label>
            <label>
                Impact
                <select name="impact" value={formData.impact} onChange={handleInputChange}>
                  <option value="">Select Impact</option>
                  {impactOptions.length > 0 ? (
                    impactOptions.map((option) => (
                      <option key={option._id} value={option.name}>
                        {option.label}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading options...</option>
                  )}
                </select>
              </label>
              <label>
                Tolerance
                <select name="tolerance" value={formData.tolerance} onChange={handleInputChange}>
                  <option value="">Select Tolerance</option>
                  {toleranceOptions.length > 0 ? (
                    toleranceOptions.map((option) => (
                      <option key={option._id} value={option.name}>
                        {option.label}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading options...</option>
                  )}
                </select>
              </label>
            <label>
              Zoom In:
              <select
                name="zoom_in"
                value={formData.zoom_in}
                onChange={handleInputChange}
                required
              >
                {zoomInOptions.map(option => (
                  <option key={option.aggregate_id} value={option.aggregate_id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              style={{ padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "10px" }}
            >
              Save
            </button>
          </form>
        </div>
      )}

      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {radarItems.length === 0 ? (
          <li>No radar items yet</li>
        ) : (
          radarItems.map((item) => (
            <li key={item.aggregate_id} style={{ padding: "10px", border: "1px solid #ccc", marginBottom: "10px" }}>
              <h3>{item.name}</h3>
              <p><strong>Description:</strong> {item.description}</p>
              <button
                onClick={() => handleEdit(item)}
                style={{ padding: "5px 10px", backgroundColor: "#FFA500", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
              >
                Edit
              </button>
            </li>
          ))
        )}
      </ul>

      {/* Log messages */}
      <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f4f4f4", borderTop: "1px solid #ccc", maxHeight: "200px", overflowY: "scroll" }}>
        <h3>Logs</h3>
        <ul>
          {logs.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}