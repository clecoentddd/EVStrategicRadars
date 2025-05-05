import React, { useState, useRef, useEffect} from 'react';
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
  const [expandedConfigs, setExpandedConfigs] = useState({});
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

  const groupedConfigs = configurations.reduce((acc, config) => {
    if (!acc[config.level]) acc[config.level] = [];
    acc[config.level].push(config);
    return acc;
  }, {});

  return (
    <div className={styles.organisationList}>
      {Object.entries(groupedConfigs).map(([level, configs]) => (
        <div key={level}>
          <div className={styles.levelHeader}>
            Level <span className={styles.levelCircle}>{level}</span>
          </div>

          <div className={styles.cardGrid}>
            {configs.map(config => (
              <div key={config.id} className={styles.card}>
                <div className={styles.cardHeader} onClick={() => toggleConfig(config.id)}>
                  <h3 className={styles.cardTitle}>{config.name}</h3>
                  <p className={styles.purposeText}>{config.purpose}</p>
                </div>

                {expandedConfigs[config.id] && (
                  <div className={styles.cardButtons}>
                    <button onClick={() => viewConfig(config.name, config.id)} className={styles.buttonViewRadar}>View Radar</button>
                    <button onClick={() => viewStream(config.id)} className={styles.buttonViewStrategy}>View Strategy</button>
                    <button onClick={() => aiCoach.toggleAICoach(config.id)} className={styles.buttonAICoach}>AI Coach</button>
                    <button onClick={() => onToggleForm('update', config)} className={styles.buttonEdit}>Edit</button>
                    <button onClick={() => onDelete(config.id)} className={styles.buttonDelete}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Render AI Coach forms outside grid */}
          {configs.map(config =>
            aiCoach.aiCoachVisible[config.id] && (
              <div key={`ai-form-${config.id}`} className={styles.formContainer}>
                <AICoachForm config={config} aiCoach={aiCoach} />
              </div>
            )
          )}

          {/* Render update form outside grid */}
          {isUpdateFormVisible && configToUpdate && configs.find(c => c.id === configToUpdate.id) && (
            <div className={styles.formContainer}>
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
    </div>
  );
};

export default OrganisationList;
