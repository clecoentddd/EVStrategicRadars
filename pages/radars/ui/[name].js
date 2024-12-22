import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import RadarChart from '../../../components/RadarChart';
import styles from './name.module.css'; // Import CSS Modules



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
   
    // Scroll behavior for navbar
    let prevScrollpos = window.scrollY;
    const handleScroll = async () => {
      const currentScrollPos = window.scrollY;
      const navbar = document.getElementById('navbar');
      if (navbar) {
        if (prevScrollpos > currentScrollPos) {
          navbar.style.top = '0';
        } else {
          navbar.style.top = '-50px';
        }
        prevScrollpos = currentScrollPos;
      }
    };

  // Attach event listener for scroll
    window.addEventListener('scroll', handleScroll);

  //Clean up the event listener
   return () => {
     window.removeEventListener('scroll', handleScroll);
   }
   // Keep your dependency array intact if you have specific dependencies
}, []);

useEffect(() => {

  if (!radar_id) return;

    /*const fetchRadarById = async () => {
      try {
        const response = await fetch(`/api/radar_events?id=${radar_id}`);
        const data = await response.json();

        console.log("Get radar property from ES:", response.text);
        if (response.ok) {
          setRadar(data); // Store radar data, including name and description
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch radar details - fetchRadarById');
      } finally {
        setLoadingRadar(false);
      }
    };*/

    const fetchRadar = async () => {
      try {
        setLoadingRadar(true);
        setError(null);
        logMessage("Fetching radar data...");

        const response = await fetch(`/api/radars?id=${radar_id}`);
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
        const response = await fetch(`/api/radar-items?radar_id=${radar_id}`);
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
          setZoomInOptions(radars.filter((radarItem) => radarItem.id !== radar_id));
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
    /*fetchRadarById();*/
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
      console.log("handleEdit: Entering handleEdit...with item : ", item);
      setEditMode(true);
      setCurrentEditingId(item.id); // Set the current editing item ID
      setShowForm(true); // Show the form for editing
  
      // Fetch the latest data for the selected aggregate
      console.log("handleEdit: Fetching radar item with id:", item.id);
      //const response = await fetch(`/api/radar-items?id=${item.id}`);
      const response = await fetch(`/api/radar-items?radar_id=${item.radar_id}&id=${item.id}`, {
        method: 'GET',
      });
      // Log the response status
      console.log("handleEdit: Response status: ", response.status);
  
      if (!response.ok) {
        const errorText = await response.text(); // Get the raw error text
        setError(`Failed to fetch radar item: ${errorText}`);
        console.log("handleEdit: Failed to fetch radar item: ", errorText);
        return;
      }
  
      // Get the raw response text
      const rawResponseText = await response.text(); // Read response as raw text
      console.log("handleEdit: Raw Response Text: ", rawResponseText);
  
      // Parse the raw response text as JSON
      const radarItem = JSON.parse(rawResponseText); // Safely parse JSON from text
  
      console.log("Parsed Radar Item: ", JSON.stringify(radarItem));
      console.log ("HTLM radar item name is :", radarItem.name);
  
      // Check if the response indicates success
      if (radarItem.success === false) {
        setError(radarItem.message); // Show the message from the response
        console.log("Error: ", radarItem.message);
        return;
      }
  
      console.log("Fetched radar item data successfully");
  
      // Populate the form with the fetched data
      const fetchedItem = radarItem;

      setFormData({
        name: fetchedItem.name || '',
        description: fetchedItem.description || '',
        category: fetchedItem.category || '',
        type: fetchedItem.type || '',
        distance: fetchedItem.distance || '',
        impact: fetchedItem.impact || '',
        tolerance: fetchedItem.tolerance || '',
        zoom_in: fetchedItem.zoom_in || '',
      });
    } catch (error) {
      setError('Error fetching radar item for edit');
      console.log("Error during radar item fetch: ", error.message);
    }
  };

  const handleSave = async () => {
    try {
      console.log("handleSave: Entering handleSave...");
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `/api/radar-items?id=${currentEditingId}` : `/api/radar-items`;
  
      // Wrap the data inside command.payload
      const command = {
          radar_id, // Include radar_id in the payload
          ...formData,
      };
  
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command), // Send the command structure
      });
      console.log("handleSave: HTML Payload being sent: ", JSON.stringify(command));

      console.log("handleSave: Error saving radar item 0:",response.status);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.log("handleSave: Error saving radar item 1: ",errorText);
        return;
      }
  
      // Get the raw response text
      const rawResponseText = await response.text(); // Read response as raw text
      console.log("handleSave: Raw Response Text: ", rawResponseText);
  
      // Parse the raw response text as JSON
      const radarItem = JSON.parse(rawResponseText); // Safely parse JSON from text
  
      console.log("handleSave: Parsed Radar Item: ", JSON.stringify(radarItem));
      console.log ("handleSave: radar item is : ", radarItem.name);
  
 // Update the radarItems state in both edit and save (create) modes
 setRadarItems(prevRadarItems => {
  if (editMode) {
    // Replace the updated item in the list
    return prevRadarItems.map(item =>
      item.id === currentEditingId ? radarItem : item
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

console.log("Radar item saved successfully");
} catch (err) {
console.log("Error saving radar item");
}
};


  if (loadingRadar || loadingItems) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!radar) return <p>No radar found</p>;

  return (
    <div>    

      {/* Add the sidepanel code here */}
      <div id="navbar" className={styles.navbar}>
        <a href="#Radars">1. Engage</a>
        <a href="#Detect, Assess and Respond">2. Detect, Assess and Respond</a>
        <a href="#Strategize">3. Strategize</a>
      </div>

      <div className={styles.container}>
      {loadingRadar && <p>Loading radar details...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loadingRadar && radar && (
        <>
          {/* Display Radar Name and Description */}
          <div className={styles.radarDetails}>
            <h1 className={styles.radarName}>{radar.name}</h1>
            <p className={styles.radarDescription}>{radar.description}</p>
          </div>
        </>
      )}
      </div>
         
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
  <div className={styles.showForm}> 
    <h3>{editMode ? "Edit Radar Item" : "Create Radar Item"}</h3>
    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <div className={styles.formRow}> 
        <div className={styles.column} style={{ flex: 2 }}> 
          <label htmlFor="name" className={styles.label}>
            Name
          </label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
            required 
            className={styles.inputField} 
          />
          <label htmlFor="description" className={styles.label}>
            What have you detected 
          </label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleInputChange} 
            required 
            className={styles.textArea} 
          />
          <label htmlFor="assessAndDecide" className={styles.label}>
            What is your assessment
          </label>
          <textarea 
            name="assessment" 
            value={formData.assessment} 
            onChange={handleInputChange} 
            required 
            className={styles.textArea} 
          />
          <label htmlFor="decisiveness" className={styles.label}>
            What decisions could you take
          </label>
          <textarea 
            name="decisiveness" 
            value={formData.decisiveness} 
            onChange={handleInputChange} 
            required 
            className={styles.textArea} 
          />
        </div>
        <div className={styles.column} style={{ flex: 1 }}> 
          <label htmlFor="category" className={styles.label}>
            Category
          </label>
          <select 
            name="category" 
            value={formData.category} 
            onChange={handleInputChange} 
            className={styles.inputField} 
          > 
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
          <label htmlFor="zoom_in" className={styles.label}>
            Zoom In
          </label>
          <select
            name="zoom_in"
            value={formData.zoom_in}
            onChange={handleInputChange}
            required
            className={styles.inputField}
          >
            <option value="">Select a "zoom-in" radar</option>
            {zoomInOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <label htmlFor="distance" className={styles.label}>
            Distance
          </label>
          <select
            name="distance"
            value={formData.distance}
            onChange={handleInputChange}
            className={styles.inputField}
          >
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
          <label htmlFor="impact" className={styles.label}>
            Impact
          </label>
          <select
            name="impact"
            value={formData.impact}
            onChange={handleInputChange}
            className={styles.inputField}
          >
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
          <label htmlFor="tolerance" className={styles.label}>
            Tolerance
          </label>
          <select
            name="tolerance"
            value={formData.tolerance}
            onChange={handleInputChange}
            className={styles.inputField}
          >
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
        </div>
      </div>
      <button
        type="submit"
        className={styles.saveButton}
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
            <li key={item.id} style={{ padding: "10px", border: "1px solid #ccc", marginBottom: "10px" }}>
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