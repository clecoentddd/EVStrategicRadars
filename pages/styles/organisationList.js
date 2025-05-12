import React, { useState, useRef, useEffect } from 'react';
import styles from './organisationList.module.css';
import OrganisationForm from './organisationForm';
import AICoachForm from './AICoachForm';

const OrganisationList = ({
  configurations,
  aiCoach,
  isUpdateFormVisible,
  configToUpdate,
  onUpdateSubmit,
  onToggleForm,
  onDelete,
}) => {
  const [activeConfig, setActiveConfig] = useState(null);
  const [hoveredConfig, setHoveredConfig] = useState(null); // New state to track hover
  const updateFormRef = useRef(null);
  const aiCoachRefs = useRef({});

  useEffect(() => {
    if (isUpdateFormVisible && updateFormRef.current) {
      updateFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isUpdateFormVisible]);

  useEffect(() => {
    const visibleId = Object.keys(aiCoach.aiCoachVisible).find(id => aiCoach.aiCoachVisible[id]);
    if (visibleId && aiCoachRefs.current[visibleId]) {
      aiCoachRefs.current[visibleId].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [aiCoach.aiCoachVisible]);

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

  const groupedConfigs = configurations.reduce((acc, config) => {
    if (!acc[config.level]) acc[config.level] = [];
    acc[config.level].push(config);
    return acc;
  }, {});

  return (
    <div className={styles.organisationList}>
      {Object.entries(groupedConfigs).map(([level, configs]) => (
        <div key={level} className={styles.levelSection}>
          <div className={styles.levelHeader}>
            <div className={styles.levelCircle}>{level}</div>
            <div className={styles.levelTitle}>Level {level} Organizations</div>
          </div>

          <div className={styles.pillContainer}>
            {configs.map(config => {
              const nps = config.potentialNPS ?? 0;
              const npsColor = aiCoach.getNPSColor(nps);

              return (
                <div
                  key={config.id}
                  className={`${styles.departmentPill} ${activeConfig?.id === config.id ? styles.activePill : ''}`}
                  onClick={() => setActiveConfig(config)}
                  onMouseEnter={() => setHoveredConfig(config)} // Set hovered config
                  onMouseLeave={() => setHoveredConfig(null)} // Reset hovered config
                  style={{ '--nps-color': npsColor }}
                >
                  <span>{config.name}</span>

                  {/* Show buttons on hover */}
                  {hoveredConfig?.id === config.id && (
                       <div className={styles.hoverButtons}>
                       <button onClick={(e) => {
                         e.stopPropagation();
                         viewConfig(config.name, config.id);
                       }}>View Radar</button>
                       <button onClick={(e) => {
                         e.stopPropagation();
                         viewStream(config.id);
                       }}>View Strategy</button>
                     </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* AI Coach forms */}
          {configs.map(config =>
            aiCoach.aiCoachVisible[config.id] && (
              <div key={`ai-form-${config.id}`} className={styles.formContainer} ref={el => aiCoachRefs.current[config.id] = el}>
                <AICoachForm config={config} aiCoach={aiCoach} />
              </div>
            )
          )}

          {/* Update form */}
          {isUpdateFormVisible && configToUpdate && configs.find(c => c.id === configToUpdate.id) && (
            <div className={styles.formContainer} ref={updateFormRef}>
              <OrganisationForm
                mode="update"
                config={configToUpdate}
                onSubmit={onUpdateSubmit}
                onCancel={() => onToggleForm(null)}
              />
            </div>
          )}
        </div>
      ))}

      {/* Slide-out panel */}
      {activeConfig && (
        <div className={styles.slideOutPanel}>
          <div className={styles.panelHeader}>
            <button onClick={() => setActiveConfig(null)} className={styles.closeButton}>✖</button>
            <h3>{activeConfig.name}</h3>
            <p>{activeConfig.purpose}</p>
          </div>
          <div className={styles.panelActions}>
          <button
            className={`${styles.panelButton} ${styles.aiCoachButton}`}
            onClick={() => aiCoach.toggleAICoach(activeConfig.id)}
          >
            AI Coach
          </button>

          <button
            className={`${styles.panelButton} ${styles.editButton}`}
            onClick={() => onToggleForm('update', activeConfig)}
          >
            Edit Organization
          </button>

          <button
            className={`${styles.panelButton} ${styles.deleteButton}`}
            onClick={() => onDelete(activeConfig.id)}
          >
            Delete Organization
          </button>
        </div>

        </div>
      )}
    </div>
  );
};

export default OrganisationList;
