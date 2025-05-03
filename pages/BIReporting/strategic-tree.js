import React, { useState, useEffect } from 'react';
import styles from './BIReporting.module.css';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function StrategicTree() {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        const response = await fetch('/api/build-tree');
        if (!response.ok) throw new Error('Failed to fetch tree data');
        const data = await response.json();
        setTreeData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTreeData();
  }, []);

  // Group organizations by level
  const groupByLevel = (data) => {
    const levels = {};
    data.forEach(org => {
      if (!levels[org.level]) {
        levels[org.level] = [];
      }
      levels[org.level].push(org);
    });
    return levels;
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!treeData) return null;

  const levels = groupByLevel(treeData);

  return (
    <div className={styles.dashboard}>
      {Object.keys(levels).sort((a, b) => a - b).map(level => (
        <div key={level} className={styles.levelSection}>
          <h2 className={styles.levelTitle}>Level {level}</h2>

          {/* Flex container for organization cards for this level */}
          <div className={styles.levelCardsContainer}>
            {levels[level].map(org => (
              <div key={org.id} className={styles.organizationCard}>
                <h3 className={styles.organizationName}>{org.name}</h3>

                {/* Each organization card contains its strategies */}
                <div className={styles.strategyGrid}>
                  {org.children?.map(strategy => (
                    <div key={strategy.id} className={styles.strategyCard}>
                      <div className={styles.strategyHeader}>
                        <div className={styles.strategyTitle}>{strategy.name}</div>
                        <div className={styles.progressCircle}>
                          <CircularProgressbar
                            value={strategy.avgProgress}
                            maxValue={100}
                            text={
                              typeof strategy.avgProgress === 'number'
                                ? `${strategy.avgProgress}%`
                                : '- %'
                            }
                            styles={{
                              path: {
                                stroke: getProgressColor(strategy.avgProgress),
                              },
                              text: {
                                fill: '#333',
                                fontSize: '18px',
                              },
                            }}
                          />
                        </div>
                      </div>

                      <div className={styles.initiativesList}>
                        {strategy.children?.length > 0 ? (
                          strategy.children.map(initiative => (
                            <div key={initiative.id} className={styles.initiativeItem}>
                              <div className={styles.initiativeName}>{initiative.name}</div>
                              <div className={styles.progressBarContainer}>
                                <div
                                  className={styles.progressBar}
                                  style={{
                                    width: `${initiative.progress}%`,
                                    backgroundColor: getProgressColor(initiative.progress),
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className={styles.noInitiatives}>No initiatives</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper to pick a color based on progress
function getProgressColor(progress) {
  if (typeof progress !== 'number') return '#bdc3c7'; // Grey for no value
  if (progress >= 80) return '#8e44ad'; // Purple
  if (progress >= 50) return '#f39c12'; // Orange
  return '#8e44ad'; // Purple for low progress too
}
