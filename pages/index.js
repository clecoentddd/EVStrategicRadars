import React, { useState, useEffect, useRef } from 'react';
import styles from './styles/index.module.css';
import useAICoach from './indexAICoach';
import createRadar from './services/createRadarIndex';
import updateRadar from './services/updateRadarIndex';
import deleteRadar from './services/deleteRadarIndex';

// Spinner from react
import { ClipLoader } from 'react-spinners';

function HomePage() {
  const [radars, setRadars] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSynced, setIsSynced] = useState(false);
  const [expandedRadars, setExpandedRadars] = useState({});
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false); // For Create form
  const [isUpdateFormVisible, setIsUpdateFormVisible] = useState(false); // For Update form
  const [radarToUpdate, setRadarToUpdate] = useState(null);

   // Use the AI Coaching custom hook
   const {
    aiCoachVisible,
    aiCoachData,
    loading,
    evaluationsTextareaRefs,
    suggestionsTextareaRefs,
    toggleAICoach,
    handleCallAICoach,
    getNPSColor,
    handleSaveAICoachResponse,
  } = useAICoach();
  
  // Function to auto-resize textareas
  const autoResizeTextarea = (textareaRef) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Effect to auto-resize textareas when AI Coach data changes
  useEffect(() => {
    Object.keys(aiCoachData).forEach((radarId) => {
      if (evaluationsTextareaRefs.current[radarId]) {
        autoResizeTextarea(evaluationsTextareaRefs.current[radarId]);
      }
      if (suggestionsTextareaRefs.current[radarId]) {
        autoResizeTextarea(suggestionsTextareaRefs.current[radarId]);
      }
    });
  }, [aiCoachData]);

  useEffect(() => {
    console.log(`isCreateFormVisible updated to: ${isCreateFormVisible}`); // Debugging log
  }, [isCreateFormVisible]);

  // Fetch radars on component mount
  useEffect(() => {
    const fetchRadars = async () => {
      try {
        const response = await fetch('/api/radars-fetch');
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

  // Check sync status
  const checkSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync-status');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setIsSynced(data.isSynced);
    } catch (error) {
      console.error('Error checking sync status:', error.message);
    }
  };

 
  const handleCreate = async (event) => {
    event.preventDefault();
  
    const name = event.target.name.value;
    const purpose = event.target.purpose.value;
    const context = event.target.context.value;
    const level = parseInt(event.target.level.value, 10);
  
    try {
      const newRadar = await createRadar(name, purpose, context, level);
      console.log('final preparing reading result for setRadars', newRadar);
  
      // Correctly add the new radar to the array
      const updatedRadars = [...radars, newRadar];
  
      console.log('Updated radars:', updatedRadars); // Log the updated radars array
      setRadars(updatedRadars); // Update the state with the new array
  
      setErrorMessage(null);
      setIsCreateFormVisible(false); // Close the form
      setSuccessMessage(`Radar "${newRadar.name}" created successfully!`);
    } catch (error) {
      console.error('Error saving radar:', error.message);
      setErrorMessage(error.message);
      alert('Error creating radar. Please try again.');
    }
  };


  const handleUpdate = async (event) => {
    event.preventDefault();

    const name = event.target.name.value;
    const purpose = event.target.purpose.value;
    const context = event.target.context.value;
    const level = parseInt(event.target.level.value, 10);

    try {
      if (radarToUpdate) {
        const result = await updateRadar(radarToUpdate.id, name, purpose, context, level);
        console.log('index.js - radarToUpdate result from update is', result.name);
        
        // Log the new values from the result object
        console.log('index.js - New values for update - Name:', result.name, 'Purpose:', result.purpose, 'Context:', result.context, 'Level:', result.level);
        
        // Update the radar in the state
        setRadars((prevRadars) => {
          console.log("handleUpdateRadar: Previous radars before update:", prevRadars);
        
          // Use the result object to update the radar
          const updatedRadars = prevRadars.map((radar) =>
            radar.id === radarToUpdate.id ? { ...radar, name: result.name, purpose: result.purpose, context: result.context, level: result.level } : radar
          );
        
          console.log("handleUpdateRadar: Updated radars after update:", updatedRadars);
          return updatedRadars;
        });

        setSuccessMessage(`Radar "${result.name}" updated successfully!`);
        setIsUpdateFormVisible(false); // Close the form
        setRadarToUpdate(null); // Clear radarToUpdate
      } else {
        console.error('Error: No radar selected for update.');
        setErrorMessage('Error updating radar...');
      }
    } catch (error) {
      console.error('index.js Error updating radar:', error.message);
      setErrorMessage('Error updating radar. Please try again.');
    }
  };

  const toggleForm = (mode, radar = null) => {
    console.log(`toggleForm called with mode: ${mode}`); // Debugging log
    if (mode === 'create') {
      console.log('Setting isCreateFormVisible to true'); // Debugging log
      setIsCreateFormVisible(true); // Show Create form
      console.log('Setting isCreateFormVisible set to :', isCreateFormVisible); // Debugging log
      setIsUpdateFormVisible(false); // Hide Update form
      setRadarToUpdate(null); // Clear radar data
    } else if (mode === 'update') {
      console.log('Setting isUpdateFormVisible to true'); // Debugging log
      setIsUpdateFormVisible(true); // Show Update form
      setIsCreateFormVisible(false); // Hide Create form
      setRadarToUpdate(radar); // Set radar data for editing
    }
  };


  const toggleRadar = (radarId) => {
    setExpandedRadars((prevExpanded) => ({
      ...prevExpanded,
      [radarId]: !prevExpanded[radarId],
    }));
  };

  async function viewRadar(name, aggregateId) {
    // Navigate to the radar details page with the name and id as query parameters
    const radarPage = `/radars/ui/${encodeURIComponent(name)}?radarId=${encodeURIComponent(aggregateId)}`;
    window.location.href = radarPage;
  }

  const viewStream = async (radarId) => {
    // Fetch the active strategy stream for the radar to navigate to the strategy page
    try {
      const response = await fetch(`/api/readmodel-strategies?radarId=${encodeURIComponent(radarId)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch streams: ${response.status}`);
      }
      const stream = await response.json(); // Response is an object
      console.log('API Response:', stream);
      // Check for active_strategy_id in the response
      const streamID = stream.id;
      if (streamID) {
        // Navigate to the strategy page
        window.location.href = `/strategies/ui/${encodeURIComponent(streamID)}`;
      } else {
        alert('No active stream found for this radar.');
      }
    } catch (error) {
      console.error('Error fetching stream:', error.message);
      alert('Failed to fetch strategies. Please try again later.');
    }
  };

  
  const handleDelete = async (radarId) => {
    console.log('handleDelete', radarId);
    const response = await deleteRadar(radarId);

    if (response) {
      if (response) {
        // Radar successfully deleted
        setSuccessMessage('Radar deleted successfully!');
        // Option 2: Refresh the page
        window.location.reload();
      } else {
        console.log(`Failed to delete radar: ${response.status}`);
        setErrorMessage('Failed to delete the radar...');
      }
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>SPARK - Strategies that are executable</h1>
          <h2 className={styles.headerSubtitle}>
            Agility: “the organizational capacity to detect, assess and respond to environmental changes in ways that are purposeful, decisive and grounded in a will to win.” 
            Leo Tilman / General Charles Jacoby
          </h2>
          <button
            id="sync-status"
            className={isSynced ? styles.buttonGreen : styles.buttonRed}
            onClick={checkSyncStatus}
          >
            {isSynced ? 'Synced' : 'Sync Issue'}
          </button>
        </div>
      </div>
      <button
        id="create-radar-button"
        className={styles.buttonCreateRadar}
        onClick={() => {
          toggleForm('create');
        }}
      >
        Create a new organisation
      </button>
      {isCreateFormVisible && (
        console.log('Rendering Create Form'), // Debugging log
        <div id="create-form" className={styles.createFormContainer} >
          <h2>Create Radar</h2>
          <form onSubmit={handleCreate}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <br />
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={''} // Use defaultValue instead of value
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="level">Level</label>
              <br />
              <input
                type="number"
                id="level"
                name="level"
                min="0"
                required
                style={{ width: '50px' }}
                defaultValue={''} // Use defaultValue instead of value
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="purpose">What is your purpose? Why do you get up in the morning?</label>
              <br />
              <textarea
                id="purpose"
                name="purpose"
                required
                rows="5"
                className={styles.purposeTextarea}
                defaultValue={''} // Use defaultValue instead of value
              ></textarea>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="context">What is your context? Could you describe what activities you cover?</label>
              <br />
              <textarea
                id="context"
                name="context"
                required
                rows="5"
                className={styles.purposeTextarea}
                defaultValue={''} // Use defaultValue instead of value
              ></textarea>
            </div>
            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.button}>
                Save
              </button>
              <button
                type="button"
                className={styles.button}
                onClick={() => setIsCreateFormVisible(false)} // Close the form
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
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
            {levelGroup.radars.map((radar) => {
              evaluationsTextareaRefs.current[radar.id] = evaluationsTextareaRefs.current[radar.id] || React.createRef();
              suggestionsTextareaRefs.current[radar.id] = suggestionsTextareaRefs.current[radar.id] || React.createRef();
  
              return (
                <div key={radar.id} className={styles.radarItem}>
                  <div className={styles.radarHeader}>
                    <h3 onClick={() => toggleRadar(radar.id)}>
                      {radar.name}
                      <span
                        style={{
                          display: 'inline-block',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: radar.potentialNPS === null ? 'grey' : getNPSColor(radar.potentialNPS || 0),
                          marginLeft: '8px',
                          verticalAlign: 'middle',
                        }}
                        title={`NPS: ${radar.potentialNPS || 0}`}
                      ></span>
                      <br />
                      <span className={styles.radarPurpose}>{radar.purpose}</span>
                    </h3>
                  </div>
                  <div
                    className={styles.radarDetails}
                    style={{
                      display: expandedRadars[radar.id] ? 'block' : 'none',
                    }}
                  >
                    <button
                      className={styles.buttonAICoach}
                      onClick={() => toggleAICoach(radar.id)}
                      disabled={loading}
                    >
                      AI Coach
                    </button>
                    {aiCoachVisible[radar.id] && (
                      <div className={styles.aiCoachSubMenu}>
                        <div>
                          <label>Potential NPS Score</label>
                          <input
                            type="text"
                            value={aiCoachData[radar.id]?.potentialNPS || ''}
                            onChange={(e) =>
                              setAICoachData((prev) => ({
                                ...prev,
                                [radar.id]: {
                                  ...prev[radar.id],
                                  potentialNPS: e.target.value,
                                },
                              }))
                            }
                            placeholder="Potential NPS Value"
                            style={{
                              backgroundColor: getNPSColor(aiCoachData[radar.id]?.potentialNPS || 0),
                              color: 'white',
                              fontWeight: 'bold',
                              padding: '8px',
                              border: 'none',
                              borderRadius: '4px',
                            }}
                          />
                          {aiCoachData[radar.id]?.potentialNPS && (
                            <span
                              style={{
                                backgroundColor: getNPSColor(aiCoachData[radar.id]?.potentialNPS || 0),
                                padding: '4px',
                                borderRadius: '4px',
                                color: 'white',
                              }}
                            ></span>
                          )}
                        </div>
                        <div>
                          <label>Evaluations</label>
                          <textarea
                            ref={evaluationsTextareaRefs.current[radar.id]}
                            value={aiCoachData[radar.id]?.evaluations || ''}
                            onChange={(e) =>
                              setAICoachData((prev) => ({
                                ...prev,
                                [radar.id]: {
                                  ...prev[radar.id],
                                  evaluations: e.target.value,
                                },
                              }))
                            }
                            placeholder="Enter evaluations"
                            rows={1}
                            style={{
                              width: '100%',
                              resize: 'none',
                              overflow: 'hidden',
                            }}
                          />
                        </div>
                        <div>
                          <label>Suggestions</label>
                          <textarea
                            ref={suggestionsTextareaRefs.current[radar.id]}
                            value={aiCoachData[radar.id]?.suggestions || ''}
                            onChange={(e) =>
                              setAICoachData((prev) => ({
                                ...prev,
                                [radar.id]: {
                                  ...prev[radar.id],
                                  suggestions: e.target.value,
                                },
                              }))
                            }
                            placeholder="Enter suggestions"
                            rows={1}
                            style={{
                              width: '100%',
                              resize: 'none',
                              overflow: 'hidden',
                            }}
                          />
                        </div>
                        <div className={styles.aiCoachContainer}>
                          <button
                            className={styles.buttonCallAICoach}
                            onClick={() => handleCallAICoach(radar.id, radar.purpose, radar.context)}
                            disabled={loading}
                          >
                            Call AI Coach
                          </button>
                          <button
                            className={styles.buttonSaveAICoach}
                            onClick={() => {
                              const potentialNPS = aiCoachData[radar.id]?.potentialNPS;
                              const evaluations = aiCoachData[radar.id]?.evaluations;
                              const suggestions = aiCoachData[radar.id]?.suggestions;
                              handleSaveAICoachResponse(radar.id, potentialNPS, evaluations, suggestions);
                            }}
                            disabled={loading}
                          >
                            Save
                          </button>
                          {loading && <ClipLoader color="#09f" loading={loading} size={20} />}
                        </div>
                      </div>
                    )}
                    <button
                      className={styles.buttonViewRadar}
                      onClick={() => viewRadar(radar.name, radar.id)}
                    >
                      View Radar
                    </button>
                    <button
                      className={styles.buttonViewStrategy}
                      onClick={() => viewStream(radar.id)}
                    >
                      View Strategy
                    </button>
                    <button
                      className={styles.buttonUpdate}
                      onClick={() => toggleForm('update', radar)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.buttonDelete}
                      onClick={() => handleDelete(radar.id)}
                    >
                      Delete
                    </button>

                    {isUpdateFormVisible && radarToUpdate?.id === radar.id && (
                    <div className={styles.updateFormContainer}>
                      <h2>Update Radar</h2>
                      <form onSubmit={handleUpdate}>
                        <div className={styles.formGroup}>
                          <label htmlFor="name">Name</label>
                          <br />
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={radarToUpdate.name || ''}
                            onChange={(e) =>
                              setRadarToUpdate((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="level">Level</label>
                          <br />
                          <input
                            type="number"
                            id="level"
                            name="level"
                            min="0"
                            required
                            style={{ width: '50px' }}
                            value={radarToUpdate.level || ''}
                            onChange={(e) =>
                              setRadarToUpdate((prev) => ({
                                ...prev,
                                level: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="purpose">What is your purpose? Why do you get up in the morning?</label>
                          <br />
                          <textarea
                            id="purpose"
                            name="purpose"
                            required
                            rows="5"
                            className={styles.purposeTextarea}
                            value={radarToUpdate.purpose || ''}
                            onChange={(e) =>
                              setRadarToUpdate((prev) => ({
                                ...prev,
                                purpose: e.target.value,
                              }))
                            }
                          ></textarea>
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="context">What is business are you in? What are the key activities?</label>
                          <br />
                          <textarea
                            id="context"
                            name="context"
                            required
                            rows="5"
                            className={styles.purposeTextarea}
                            value={radarToUpdate.context || ''}
                            onChange={(e) =>
                              setRadarToUpdate((prev) => ({
                                ...prev,
                                context: e.target.value,
                              }))
                            }
                          ></textarea>
                        </div>
                        <div className={styles.buttonGroup}>
                          <button type="submit" className={styles.button}>
                            Save
                          </button>
                          <button
                            type="button"
                            className={styles.button}
                            onClick={() => {
                              setIsUpdateFormVisible(false);
                              setRadarToUpdate(null); // Reset the form
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
}

export default HomePage;