import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import RadarChart from '../../../components/RadarChart';

export default function RadarPage() {
  const [radar, setRadar] = useState(null);
  const [radarItems, setRadarItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    type: '',
    distance: '',
    impact: '',
    cost: '',
    zoom_in: '', // This will hold the selected zoom-in radar ID
  });
  const [zoomInOptions, setZoomInOptions] = useState([]);
  const [showForm, setShowForm] = useState(false); // Toggle to show/hide form
  const [editMode, setEditMode] = useState(false); // Flag to switch between create/edit mode
  const [currentEditingId, setCurrentEditingId] = useState(null); // Track the id of the item being edited
  const router = useRouter();
  const { name, radar_id } = router.query;

  useEffect(() => {
    if (!radar_id) return;

    const fetchRadar = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/radars?aggregate_id=${radar_id}`);
        const data = await response.json();

        if (response.ok) {
          setRadar(data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Error fetching radar');
      }
    };

    const fetchRadarItems = async () => {
      try {
        const response = await fetch(`/api/radaritems?radar_id=${radar_id}`);
        const data = await response.json();

        if (response.ok) {
          setRadarItems(data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Error fetching radar items');
      } finally {
        setLoading(false);
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
      }
    };

    fetchRadar();
    fetchRadarItems();
    fetchZoomInOptions();
  }, [radar_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      type: item.type,
      distance: item.distance,
      impact: item.impact,
      cost: item.cost,
      zoom_in: item.zoom_in,
    });
    setEditMode(true);
    setCurrentEditingId(item.aggregate_id); // Set the current editing item ID
    setShowForm(true);
  };

  const handleSave = async () => {
    
    console.log("Saving radar item with id:", currentEditingId); // Log the payload
   
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `/api/radaritems?aggregate_id=${currentEditingId}` : `/api/radaritems`;
  
      
      const payload = {
        payload: {
          radar_id,
          ...formData,
        },
      };
  
    console.log("Saving radar item with id:", currentEditingId); // Log the payload


    console.log("Saving radar item with payload:", payload);
  
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const text = await response.text(); // Get the raw response text
      console.log("Raw response:", text); // Log the raw response
  
      if (!response.ok) {
        console.error("Response not OK:", response.status);
        console.error("Response text:", text);
        setError("Error saving radar item: " + text); // Set error with raw response
        return; // Exit the function early
      }
  
      const data = JSON.parse(text); // Parse the JSON only if response is OK
  
      if (editMode) {
        setRadarItems(radarItems.map(item => item.aggregate_id === currentEditingId ? data : item));
      } else {
        setRadarItems([...radarItems, data]);
      }
      setShowForm(false);
      setEditMode(false);
      setCurrentEditingId(null);
    } catch (err) {
      console.error("Error during save operation:", err);
      setError('Error saving radar item');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!radar) return <p>No radar found</p>;

  return (
    <div>
      <h1>Radar: {radar.name}</h1>
      <p><strong>Aggregate ID:</strong> {radar.aggregate_id}</p>
      <p><strong>Description:</strong> {radar.description}</p>
      <p><strong>Level:</strong> {radar.org_level}</p>

      <h2>Radar Chart</h2>
      <RadarChart items={radarItems} radius={200} />

      <h2>Radar Items</h2>

      {/* Create Radar Item Button */}
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
            <div>
              <label>Name:</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div>
              <label>Description:</label>
              <input type="text" name="description" value={formData.description} onChange={handleInputChange} />
            </div>
            <div>
              <label>Category:</label>
              <input type="text" name="category" value={formData.category} onChange={handleInputChange} />
            </div>
            <div>
              <label>Type:</label>
              <input type="text" name="type" value={formData.type} onChange={handleInputChange} />
            </div>
            <div>
              <label>Distance:</label>
              <input type="text" name="distance" value={formData.distance} onChange={handleInputChange} />
            </div>
            <div>
              <label>Impact:</label>
              <input type="text" name="impact" value={formData.impact} onChange={handleInputChange} />
            </div>
            <div>
              <label>Cost:</label>
              <input type="text" name="cost" value={formData.cost} onChange={handleInputChange} />
            </div>
            <div>
              <label>Zoom In:</label>
              <select value={formData.zoom_in || ""} onChange={handleInputChange} name="zoom_in">
              <option value="">None</option>
              {zoomInOptions.map((item) => (
                <option key={item.aggregate_id} value={item.aggregate_id}>
                  {item.name}
                </option>
              ))}
            </select>
            </div>
            <div>
              <button type="submit" style={{ padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px" }}>
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Compact Radar Items List */}
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {radarItems.map((item) => (
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
        ))}
      </ul>
    </div>
  );
}
