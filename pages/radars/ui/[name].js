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
    detect: '',
    assess: '',
    respond: '',
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
  const { name, radarId } = router.query;
  const [collapsedItems, setCollapsedItems] = useState(new Array(radarItems.length).fill(true));
  
  
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

  if (!radarId) return;

  const fetchRadar = async () => {
    try {
      setLoadingRadar(true);
      setError(null);
      logMessage("Fetching radar data...");

      const response = await fetch(`/api/radars?id=${radarId}`);
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
        const response = await fetch(`/api/radar-items?radarId=${radarId}`);
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
          setZoomInOptions(radars.filter((radarItem) => radarItem.id !== radarId));
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
    fetchConfig();
    fetchRadar();
    /*fetchRadarById();*/
    fetchRadarItems();
    fetchZoomInOptions();
  }, [radarId]);

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

  const goToStrategize = async () => {
    console.log("goToStrategize -> radarId is: ", radarId);
    try {
      const response = await fetch(`/api/readmodel-strategies?radarId=${radarId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch streams: ${response.status}`);
      }
  
      const stream = await response.json(); // Response is an object
      console.log("API Response:", stream);
  
      // Check for active_strategy_id in the response
      const streamID = stream.id;
  
      if (streamID) {
        // Navigate to the strategy page
        //navigate( `/strategies/ui/streamid?${encodeURIComponent(streamID)}`);
        window.location.href = `/strategies/ui/streamid?${encodeURIComponent(streamID)}`;
      } else {
        alert('No active stream found for this radar.');
      }
    } catch (error) {
      console.error('Error fetching stream:', error.message);
      alert('Failed to fetch strategies. Please try again later.');
    }
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
      const response = await fetch(`/api/radar-items?radarId=${item.radarId}&id=${item.id}`, {
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
  
           // Populate the form with the fetched data
      const fetchedItem = radarItem;

      console.log("Fetched radar item data successfully Type is:", fetchedItem.type);
  

      setFormData({
        name: fetchedItem.name || '',
        detect: fetchedItem.detect || '',
        assess: fetchedItem.assess || '',
        respond: fetchedItem.respond || '',
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

  const toggleCollapse = (index) => {
    setCollapsedItems((prevCollapsedItems) => {
      const updatedCollapsedItems = [...prevCollapsedItems];
      updatedCollapsedItems[index] = !prevCollapsedItems[index];
      return updatedCollapsedItems;
    });
  };

  const goToHome = () => {
    router.push('/'); // Navigate to the home page
};

  const handleSave = async () => {
    try {
      console.log("handleSave: Entering handleSave...");
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `/api/radar-items?id=${currentEditingId}` : `/api/radar-items`;
  
      // Wrap the data inside command.payload
      const command = {
          radarId, // Include radarId in the payload
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
  detect: '',
  assess: '',
  respond: '',
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
        <a href="#Radars" onClick={goToHome}>1. Engage</a>
        <a href="#Detect, Assess and Respond">2. Detect, Assess and Respond</a>
        <a href="#Strategize" onClick={(e) => { e.preventDefault(); goToStrategize(); }}>3. Strategize</a>
      </div>

      <div className={styles.container}>
      {loadingRadar && <p>Loading radar details...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loadingRadar && radar && (
        <>
          {/* Display Radar Name and Description */}
          <div className={styles.radarDetails}>
            <h1 className={styles.radarName}>{radar.name}</h1>
            <p className={styles.detect}>{radar.detect}</p>
            <p className={styles.detect}>{radar.category}</p>
          </div>
        </>
      )}
      </div>
      <div className={styles.radarChart}>
        <RadarChart items={radarItems} radius={200} />
      </div>

      <h2 className={styles.radarItemsTitle}>Radar Items</h2>
      <button
        onClick={() => setShowForm(!showForm)}
        style={{ padding: "10px", backgroundColor: "plum", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginBottom: "20px" }}
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
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
                className={styles.inputField} 
              />
              <label htmlFor="detect" className={styles.label}>
                What have you detected 
              </label>
              <textarea 
                name="detect" 
                value={formData.detect} 
                onChange={handleInputChange} 
                required 
                className={styles.textArea} 
              />
              <label htmlFor="assess" className={styles.label}>
                What is your assessment
              </label>
              <textarea 
                name="assess" 
                value={formData.assess} 
                onChange={handleInputChange} 
                className={styles.textArea} 
              />
              <label htmlFor="respond" className={styles.label}>
                What decisions could you take
              </label>
              <textarea 
                name="respond" 
                value={formData.respond} 
                onChange={handleInputChange} 
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
                required 
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
              <label htmlFor="type" className={styles.label}>
                Type
              </label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleInputChange}
                required 
                className={styles.inputField} 
              > 
                <option value="">Select type</option>
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
              <label htmlFor="zoom_in" className={styles.label}>
                Zoom In
              </label>
              <select
                name="zoom_in"
                value={formData.zoom_in}
                onChange={handleInputChange}
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
      <ul className={styles.radarItemList}> 
        {radarItems.length === 0 ? (
          <li>No radar items yet</li>
        ) : (
          <ul>
          {radarItems.map((item, index) => (
              <div
              key={item.id}
              className={`${styles.radarItem} ${
                collapsedItems[index] ? styles.collapsed : styles.expanded
              }`}
              onClick={() => toggleCollapse(index)} // Toggle on click
              >
              {/* Always visible item.name */}
              <h3>{item.name} ({item.category})</h3>
    
              {/* Expanded Content */}
              {!collapsedItems[index] && (
                <div className={styles.collapsedContent}>
                  <p><strong>Detect</strong>: {item.detect}</p>
                  <p>Type: {item.type}</p>
                  <p>Category: {item.category}</p>
                  <p>Distance: {item.distance}</p>
                  <button onClick={() => handleEdit(item)} className={styles.editButton}>Edit </button>
                </div>
              )}
            </div>
          ))}
        </ul>
        )}
      </ul>

    </div>
  );
}