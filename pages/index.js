import React, { useState, useEffect } from 'react';
import styles from './styles/index.module.css';
import Navbar from "@/components/Navbar";
import ConfigurationList from './styles/organisationList';
import useAICoach from './indexAICoach';
import createOrganisation from './services/createOrganisation';
import updateOrganisation from './services/updateOrganisation';
import deleteOrganisation from './services/deleteOrganisation';

function HomePage() {
  // State management
  const [configurations, setConfigurations] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSynced, setIsSynced] = useState(false);
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [isUpdateFormVisible, setIsUpdateFormVisible] = useState(false);
  const [configToUpdate, setConfigToUpdate] = useState(null);

  // AI Coach hook
  const aiCoach = useAICoach();

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/organisations-fetch');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setConfigurations(data.sort((a, b) => a.level - b.level));
      } catch (error) {
        console.error('Error:', error);
        setErrorMessage(error.message);
      }
    };
    fetchData();
    checkSyncStatus();
  }, []);

  const checkSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync-status');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setIsSynced(data.isSynced);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Handlers
  const handleCreate = async (formData) => {
    try {
      const newConfig = await createOrganisation(
        formData.name,
        formData.purpose,
        formData.context,
        parseInt(formData.level, 10)
      );
      setConfigurations([...configurations, newConfig]);
      setIsCreateFormVisible(false);
      setSuccessMessage(`Configuration "${newConfig.name}" created!`);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.message);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const updated = await updateOrganisation(
        configToUpdate.id,
        formData.name,
        formData.purpose,
        formData.context,
        parseInt(formData.level, 10)
      );
      setConfigurations(configurations.map(c => c.id === configToUpdate.id ? updated : c));
      setIsUpdateFormVisible(false);
      setSuccessMessage(`Configuration updated!`);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.message);
    }
  };

  const handleDelete = async (configId) => {
    try {
      await deleteOrganisation(configId);
      setConfigurations(configurations.filter(c => c.id !== configId));
      setSuccessMessage('Configuration deleted!');
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.message);
    }
  };

  const toggleForm = (mode, config = null) => {
    setIsCreateFormVisible(mode === 'create');
    setIsUpdateFormVisible(mode === 'update');
    setConfigToUpdate(config);
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.headerTitle}>SPARK - Strategies that are executable</h1>
            <h2 className={styles.headerSubtitle}>
              Agility: "the organizational capacity to detect, assess and respond to environmental changes..."
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
          id="create-config-button"
          className={styles.buttonCreateRadar}
          onClick={() => toggleForm('create')}
        >
          Create An Organisation
        </button>

        <ConfigurationList
          configurations={configurations}
          aiCoach={aiCoach}
          isUpdateFormVisible={isUpdateFormVisible}
          configToUpdate={configToUpdate}
          onUpdateSubmit={handleUpdate}
          onToggleForm={toggleForm}
          onDelete={handleDelete}
        />
      </main>
    </>
  );
}

export default HomePage;