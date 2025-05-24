import React from 'react';
import StrategyItem from './StrategyItem';
import styles from './StrategyList.module.css'; // Importing the CSS Module

export default function StrategyList({ strategies, handlers, streamAggregate }) {
  const validStates = ["Draft", "Published", "Closed", "Deleted"];

  const groupedStrategies = strategies.reduce((acc, strategy) => {
    const state = strategy?.state;
    if (state && validStates.includes(state)) {
      if (!acc[state]) acc[state] = [];
      acc[state].push(strategy);
    }
    return acc;
  }, {});

  const orderedGroupedStrategies = validStates
    .filter(state => groupedStrategies[state])
    .map(state => [state, groupedStrategies[state]]);

  return (
    <div>
      <h2 className={styles.heading}>Strategies</h2> {/* Updated with CSS Module */}
      {orderedGroupedStrategies.map(([state, stateStrategies]) => (
        <div key={state} className={styles.strategyGroup}> {/* Updated with CSS Module */}
          <h2 className={`${styles.stateTitle} ${state === 'Draft' ? styles.draftState : ''}`}>
            {state}
          </h2> 
          {stateStrategies.map(strategy => (
            <StrategyItem 
              key={strategy.id} 
              strategy={strategy} 
              handlers={handlers}
              streamAggregate={streamAggregate}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
