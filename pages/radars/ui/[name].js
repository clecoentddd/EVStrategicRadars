import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';

export default function RadarPage() {
  const [radar, setRadar] = useState(null);
  const [radarItems, setRadarItems] = useState([]);  // State to store radar items
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { name, radar_id } = router.query;  // Extracting `name` and `radar_id` from the query string

  useEffect(() => {
    if (!radar_id) return;  // Avoid fetching if radar_id is not yet available

    // Function to fetch radar by aggregate_id
    const fetchRadar = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch radar details using aggregate_id
        const response = await fetch(`/api/radars?aggregate_id=${radar_id}`);
        const data = await response.json();

        if (response.ok) {
          setRadar(data);  // Store radar data
        } else {
          setError(data.message);  // Display error message if any
        }
      } catch (err) {
        setError('Error fetching radar');
      }
    };

    // Function to fetch all radar items for the given radar_id
    const fetchRadarItems = async () => {
      try {
        // Fetch all radar items using radar_id
        const response = await fetch(`/api/radaritems?radar_id=${radar_id}`);
        const data = await response.json();

        if (response.ok) {
          setRadarItems(data);  // Store radar items
        } else {
          setError(data.message);  // Display error message if any
        }
      } catch (err) {
        setError('Error fetching radar items');
      } finally {
        setLoading(false);
      }
    };

    // Fetch radar and radar items when radar_id is available
    fetchRadar();
    fetchRadarItems();
  }, [radar_id]);  // This effect runs whenever radar_id changes

  // If loading, show a loading message
  if (loading) return <p>Loading...</p>;

  // If error occurred, show the error
  if (error) return <p>Error: {error}</p>;

  // If no radar found, show a message
  if (!radar) return <p>No radar found</p>;

  return (
    <div>
      <h1>Radar: {radar.name}</h1>
      <p><strong>Aggregate ID:</strong> {radar.aggregate_id}</p>
      <p><strong>Description:</strong> {radar.description}</p>
      <p><strong>Level:</strong> {radar.org_level}</p>

      <h2>Radar Items</h2>
      {radarItems.length === 0 ? (
        <p>No radar items found for this radar.</p>
      ) : (
        <ul>
          {radarItems.map((item) => (
            <li key={item.aggregate_id}>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Create Radar Item Button */}
      <button 
        onClick={() => router.push(`/create-radar-item?radar_id=${radar_id}`)}
        style={{ padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
      >
        Create Radar Item
      </button>
    </div>
  );
}
