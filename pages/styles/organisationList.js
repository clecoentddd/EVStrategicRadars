import React, { useState } from 'react';
import styles from './index.module.css';
import ConfigurationForm from './organisationForm';
import AICoachForm from './AICoachForm';

const ConfigurationList = ({ 
  configurations, 
  aiCoach,
  isUpdateFormVisible,
  configToUpdate,
  onUpdateSubmit,
  onToggleForm,
  onDelete
}) => {
  const [expandedConfigs, setExpandedConfigs] = useState({});

  const toggleConfig = (configId) => {
    setExpandedConfigs(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }));
  };

  const viewConfig = (name, id) => {
    window.location.href = `/radars/ui/${encodeURIComponent(name)}?radarId=${encodeURIComponent(id)}`;
  };

  const viewStream = async (configId) => {
    try {
      const response = await fetch(`/api/readmodel-strategies?radarId=${encodeURIComponent(configId)}`);
      const data = await response.json();
      if (data.id) window.location.href = `/strategies/ui/${encodeURIComponent(data.id)}`;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className={styles.radarListContainer}>
      {Object.values(
        configurations.reduce((acc, config) => {
          if (!acc[config.level]) acc[config.level] = { level: config.level, configs: [] };
          acc[config.level].configs.push(config);
          return acc;
        }, {})
      ).map(levelGroup => (
        <div key={levelGroup.level}>
          <h2 className={styles.levelHeader}>Level {levelGroup.level}</h2>
          {levelGroup.configs.map(config => (
            <div key={config.id} className={styles.radarItem}>
              <div className={styles.radarHeader} onClick={() => toggleConfig(config.id)}>
                <h3>
                  {config.name}
                  <span
                    style={{
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: config.potentialNPS === null ? 'grey' : aiCoach.getNPSColor(config.potentialNPS || 0),
                      marginLeft: '8px',
                      verticalAlign: 'middle',
                    }}
                    title={`NPS: ${config.potentialNPS || 0}`}
                  ></span>
                  <br />
                  <span className={styles.radarPurpose}>{config.purpose}</span>
                </h3>
              </div>

              {expandedConfigs[config.id] && (
                <div className={styles.radarDetails}>
                  <AICoachForm 
                    config={config} 
                    aiCoach={aiCoach}
                  />

                  <button className={styles.buttonViewRadar} onClick={() => viewConfig(config.name, config.id)}>
                    View Radar
                  </button>
                  <button className={styles.buttonViewStrategy} onClick={() => viewStream(config.id)}>
                    View Strategy
                  </button>
                  <button className={styles.buttonUpdate} onClick={() => onToggleForm('update', config)}>
                    Edit
                  </button>
                  <button className={styles.buttonDelete} onClick={() => onDelete(config.id)}>
                    Delete
                  </button>

                  {isUpdateFormVisible && configToUpdate?.id === config.id && (
                    <ConfigurationForm
                      mode="update"
                      config={configToUpdate}
                      onSubmit={onUpdateSubmit}
                      onCancel={() => onToggleForm(null)}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ConfigurationList;