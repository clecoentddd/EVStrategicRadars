import React, { useState, useEffect } from 'react';
import styles from './styles/index.module.css';
import createRadar from './services/createRadarIndex';
import updateRadar from './services/updateRadarIndex';

function HomePage() {
  const [radars, setRadars] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSynced, setIsSynced] = useState(false);
  const [expandedRadars, setExpandedRadars] = useState({});
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'update'
  const [radarToUpdate, setRadarToUpdate] = useState(null);

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

  const handleCreate = async (event) => {
    event.preventDefault();

    const name = event.target.name.value;
    const description = event.target.description.value;
    const level = parseInt(event.target.level.value, 10);

    try {
      const result = await createRadar(name, description, level);
      setRadars([...radars, result.radar]); // Add the new radar to the state
      setErrorMessage(null);
      setIsFormVisible(false); // Close the form
      setSuccessMessage(`Radar "${result.radar.name}" created successfully!`);
    } catch (error) {
      console.error('Error saving radar:', error.message);
      setErrorMessage(error.message);
      alert('Error creating radar. Please try again.');
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    const name = event.target.name.value;
    const description = event.target.description.value;
    const level = parseInt(event.target.level.value, 10);

    try {
      if (radarToUpdate) {
        const result = await updateRadar(radarToUpdate.id, name, description, level);

        // Update the radar in the state
        setRadars((prevRadars) =>
          prevRadars.map((radar) =>
            radar.id === radarToUpdate.id ? { ...radar, name, description, level } : radar
          )
        );

        setSuccessMessage(`Radar "${result.radar.name}" updated successfully!`);
        setIsFormVisible(false); // Close the form
        setRadarToUpdate(null); // Clear radarToUpdate
      } else {
        console.error('Error: No radar selected for update.');
      }
    } catch (error) {
      console.error('Error updating radar:', error.message);
      setErrorMessage('Error updating radar. Please try again.');
    }
  };

  const toggleForm = (mode, radar = null) => {
    setIsFormVisible(true); // Always open the form when toggling
    setFormMode(mode);
    setRadarToUpdate(radar); // Set the radar to update if in update mode
  };

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

  const toggleRadar = (radarId) => {
    setExpandedRadars((prevExpanded) => ({
      ...prevExpanded,
      [radarId]: !prevExpanded[radarId],
    }));
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
            {isSynced ? 'Synced' : 'Sync Issue'}
          </button>
        </div>
        <button
          id="create-radar-button"
          className={styles.buttonCreateRadar}
          onClick={() => toggleForm('create')}
        >
          Create Radar
        </button>
        <div
          id="create-form"
          className={styles.createFormContainer}
          style={{ display: isFormVisible ? 'block' : 'none' }}
        >
          <h2>{formMode === 'create' ? 'Create Radar' : 'Update Radar'}</h2>
          <form onSubmit={formMode === 'create' ? handleCreate : handleUpdate}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <br />
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={radarToUpdate?.name || ''}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="level">Level</label>
              <br />
              <input
                type="number"
                id="level"
                name="level"
                min="1"
                required
                style={{ width: '50px' }}
                defaultValue={radarToUpdate?.level || ''}
              />
            </div>
            <div className={styles.levelSeparator}></div>
            <div className={styles.formGroup}>
              <label htmlFor="description">Purpose</label>
              <br />
              <textarea
                id="description"
                name="description"
                required
                rows="5"
                className={styles.descriptionTextarea}
                defaultValue={radarToUpdate?.description || ''}
              ></textarea>
            </div>
            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.button}>
                {formMode === 'create' ? 'Save' : 'Update'}
              </button>
              <button
                type="button"
                className={styles.button}
                onClick={() => setIsFormVisible(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
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
              {levelGroup.radars.map((radar) => (
                <div key={radar.id} className={styles.radarItem}>
                  <div className={styles.radarHeader}>
                    <h3 onClick={() => toggleRadar(radar.id)}>{radar.name}</h3>
                  </div>
                  <div
                    className={styles.radarDetails}
                    style={{
                      display: expandedRadars[radar.id] ? 'block' : 'none',
                    }}
                  >
                    <p>{radar.description}</p>
                    <p>
                      <small>id: {radar.id}</small>
                    </p>
                    <button
                      className={styles.buttonViewRadar}
                      onClick={() => viewRadar(radar.name, radar.id)}
                    >
                      View
                    </button>
                    <button
                      className={styles.buttonUpdate}
                      onClick={() => toggleForm('update', radar)}
                    >
                      Update
                    </button>
                    <button
                      className={styles.buttonDelete}
                      onClick={() => alert('API to be implemented')}
                    >
                      Delete
                    </button>
                    <button
                      className={styles.buttonViewStrategy}
                      onClick={() => viewStream(radar.id)}
                    >
                      View Strategies
                    </button>
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
