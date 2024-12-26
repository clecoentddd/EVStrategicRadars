import React, { useState, useEffect } from 'react';
import styles from './styles/index.module.css';


function HomePage() {
  const [radars, setRadars] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSynced, setIsSynced] = useState(false);
  const [expandedRadars, setExpandedRadars] = useState({}); 

  useEffect(() => {
    const fetchRadars = async () => {
      try {
        const response = await fetch('/api/radars');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const fetchedRadars = await response.json();
        setRadars(fetchedRadars.sort((a, b) => a.level - b.level));
      } catch (error) {
        console.error('Error fetching radars:', error.message);
        setErrorMessage(error.message);
      }
    };

    fetchRadars();
    checkSyncStatus();
  }, []);

  const checkSyncStatus = async () => { 
    try {
      const response = await fetch("/api/sync-status");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setIsSynced(data.isSynced);
    } catch (error) {
      console.error("Error checking sync status:", error.message);
    }
  };

  const toggleRadar = (radarId) => {
    setExpandedRadars((prevExpanded) => ({
      ...prevExpanded,
      [radarId]: !prevExpanded[radarId], 
    }));
  };

  const toggleCreateForm = (show) => {
    console.log("toggleCreateForm called with show:", show); 
  
    const createForm = document.getElementById("create-form");
    const createRadarButton = document.getElementById("create-radar-button");
  
    if (createForm && createRadarButton) { 
      console.log("createForm and createRadarButton found.");
  
      createForm.style.display = show ? "block" : "none";
      createRadarButton.style.display = show ? "none" : "block";
  
      console.log("createForm.style.display:", createForm.style.display);
      console.log("createRadarButton.style.display:", createRadarButton.style.display); 
    } else {
      console.error("Could not find create-form or create-radar-button elements.");
    }
  };

  const cancelCreateRadar = () => {
    toggleCreateForm(false);
  };

  const saveRadar = async () => {
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const level = parseInt(document.getElementById("level").value, 10);

    try {
      const response = await fetch("/api/radars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description, level }),
      });

      const result = await response.json();
      const resultMessage = document.getElementById("result-message");

      console.log("SaveRadar: getting from API", result);
      if (response.ok) {
        setRadars([...radars, result.radar]);
        resultMessage.style.display = "block";
        resultMessage.innerHTML = `Radar created successfully!`;
        toggleCreateForm(false);
      } else {
        resultMessage.style.display = "block";
        resultMessage.style.backgroundColor = "red";
        resultMessage.innerHTML = `Error: ${result.message}`;
      }
    } catch (error) {
      console.error("Error saving radar:", error.message);
      setErrorMessage(error.message);
    }
  };

  const addRadarToList = (radar) => {
    setRadars([...radars, radar]);
  };

  async  function viewRadar(name, aggregateId) {
    // Navigate to the radar details page with the name and id as query parameters
    const radarPage = `/radars/ui/${encodeURIComponent(name)}?radar_id=${encodeURIComponent(aggregateId)}`;
    window.location.href = radarPage;
  }

  const viewStream = async (radarId) => {
    try {
      const response = await fetch(`/api/readmodel-strategies?radar_id=${encodeURIComponent(radarId)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch streams: ${response.status}`);
      }

      const stream = await response.json(); // Response is an object
      console.log("API Response:", stream);

      // Check for active_strategy_id in the response
      const streamID = stream.id;

      if (streamID) {
        // Navigate to the strategy page
        window.location.href = `/strategies/ui/streamid?${encodeURIComponent(streamID)}`;
            } else {
        alert('No active stream found for this radar.');
      }
    } catch (error) {
      console.error('Error fetching stream:', error.message);
      alert('Failed to fetch strategies. Please try again later.');
    }
  };

  return (
    <main className={styles.main}> 
      <div className={styles.container}> 
      <div className={styles.header}> 
          <h1>Radars</h1> 
          <button 
            id="sync-status" 
            className={isSynced ? styles.buttonGreen : styles.buttonRed}
            onClick={checkSyncStatus}
          >
            {isSynced ? "Synced" : "Sync Issue"} 
          </button>
        </div> 
        <button id="create-radar-button" className={styles.buttonCreateRadar}
        onClick={() => toggleCreateForm(true)} // Attach click event handler here
        >
          Create Radar
        </button>
        {/* Create Radar Form */}
        <div id="create-form" className={styles.createFormContainer} style={{ display: 'none' }}> 
          <h2>Create Radar</h2>
          <form onSubmit={(e) => { e.preventDefault(); saveRadar(); }}>
            <div className={styles.formGroup}> 
              <label htmlFor="name">Name</label><br/>
              <input type="text" id="name" required />
            </div>
            <div className={styles.formGroup}> 
              <label htmlFor="level">Level</label><br/>
              <input type="number" id="level" min="1" required style={{ width: '50px' }} />
            </div>
            <div className={styles.levelSeparator}></div> 
            <div className={styles.formGroup}>
              <label htmlFor="description">Purpose</label><br/>
              <textarea id="description" required rows="5" className={styles.descriptionTextarea}></textarea>
            </div>
            <div className={styles.buttonGroup}> 
              <button type="submit" className={styles.button}>Save</button>
              <button type="button" className={styles.button} onClick={cancelCreateRadar}>Cancel</button>
            </div>
          </form>
        </div>

        {/* Success Message */}
        <div id="result-message" style={{ display: 'none' }}></div>

        {/* Radar List */}
        <div className={styles.radarListContainer}> 
          {Object.values(
            radars
              .sort((a, b) => a.level - b.level) 
              .reduce((acc, radar) => {
                const { level } = radar;
                if (!acc[level]) {
                  acc[level] = { level, radars: [] };
                }
                acc[level].radars.push(radar);
                return acc;
              }, {})
          ).map((levelGroup) => ( 
            <div key={levelGroup.level}> 
              <h2 className={styles.levelHeader}>Level {levelGroup.level}</h2> 
              {levelGroup.radars.map(radar => (
                <div key={radar.id} className={styles.radarItem}>
                  <div className={styles.radarHeader}> 
                    <h3 onClick={() => toggleRadar(radar.id)}>
                      {radar.name} 
                    </h3>
                  </div>
                  <div className={styles.radarDetails} style={{ display: expandedRadars[radar.id] ? 'block' : 'none' }}>
                    <p>{radar.description}</p>
                    <p><small>id: {radar.id}</small></p>
                    <button className={styles.buttonViewRadar} onClick={() => viewRadar(radar.name, radar.id)}>View</button>
                    <button className={styles.buttonUpdate} onClick={() => alert('API to be implemented')}>Update</button>
                    <button className={styles.buttonDelete} onClick={() => alert('API to be implemented')}>Delete</button>
                    <button className={styles.buttonViewStrategy} onClick={() => viewStream(radar.id)}>View Strategies</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}


export default HomePage;