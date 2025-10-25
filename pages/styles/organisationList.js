import React, { useState } from 'react';
import styles from './organisationList.module.css';
import SlidePanel from './SlidePanel';
import LoadingButton from '@/components/LoadingButton';

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
  const [hoveredConfig, setHoveredConfig] = useState(null);
  const [loadingAction, setLoadingAction] = useState({ type: null, id: null });

  // Navigate to Radar view
  const viewRadarPage = (name, id) => {
    window.location.href = `/radars/ui/${encodeURIComponent(name)}?radarId=${encodeURIComponent(id)}`;
  };

  // Navigate to Strategy view
  const viewStrategyPage = async (configId) => {
    setLoadingAction({ type: 'strategy', id: configId });
    try {
      const response = await fetch(`/api/readmodel-strategies?radarId=${encodeURIComponent(configId)}`);
      const data = await response.json();
      if (data.id) {
        window.location.href = `/strategies/ui/${encodeURIComponent(data.id)}`;
      }
    } catch (error) {
      console.error('Error fetching strategy:', error);
    } finally {
      setLoadingAction({ type: null, id: null });
    }
  };

  // Group configurations by level
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
            {configs.map((config) => {
              const nps = config.potentialNPS ?? 0;
              const npsColor = aiCoach.getNPSColor(nps);

              return (
                <div
                  key={config.id}
                  className={`${styles.departmentPill} ${activeConfig?.id === config.id ? styles.activePill : ''}`}
                  onClick={() => setActiveConfig(config)}
                  onMouseEnter={() => setHoveredConfig(config)}
                  onMouseLeave={() => setHoveredConfig(null)}
                  style={{ '--nps-color': npsColor }}
                >
                  <span>{config.name}</span>

                  {/* Hover actions */}
                  {hoveredConfig?.id === config.id && (
                    <div className={styles.hoverButtons}>
                      <LoadingButton
                        isLoading={loadingAction.type === 'radar' && loadingAction.id === config.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLoadingAction({ type: 'radar', id: config.id });
                          viewRadarPage(config.name, config.id);
                        }}
                      >
                        View Radar
                      </LoadingButton>

                      <LoadingButton
                        isLoading={loadingAction.type === 'strategy' && loadingAction.id === config.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          viewStrategyPage(config.id);
                        }}
                      >
                        View Strategy
                      </LoadingButton>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Slide-out panel (for AI Coach, Edit, Delete) */}
      <SlidePanel
        activeConfig={activeConfig}
        onClose={() => setActiveConfig(null)}
        aiCoach={aiCoach}
        isUpdateFormVisible={isUpdateFormVisible}
        configToUpdate={configToUpdate}
        onToggleForm={onToggleForm}
        onUpdateSubmit={onUpdateSubmit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default OrganisationList;
