import React, { useEffect } from 'react';
import styles from './index.module.css';
import { ClipLoader } from 'react-spinners';

const AICoachForm = ({ config, aiCoach }) => {
  // Initialize refs if they don't exist
  aiCoach.evaluationsTextareaRefs.current[config.id] = 
    aiCoach.evaluationsTextareaRefs.current[config.id] || React.createRef();
  aiCoach.suggestionsTextareaRefs.current[config.id] = 
    aiCoach.suggestionsTextareaRefs.current[config.id] || React.createRef();

  // Auto-resize textareas
  useEffect(() => {
    if (aiCoach.aiCoachVisible[config.id]) {
      const resizeTextarea = (ref) => {
        if (ref.current) {
          ref.current.style.height = 'auto';
          ref.current.style.height = `${ref.current.scrollHeight}px`;
        }
      };
      
      resizeTextarea(aiCoach.evaluationsTextareaRefs.current[config.id]);
      resizeTextarea(aiCoach.suggestionsTextareaRefs.current[config.id]);
    }
  }, [aiCoach.aiCoachData, aiCoach.aiCoachVisible]);

  return (
    <>
      <button
        className={styles.buttonAICoach}
        onClick={() => aiCoach.toggleAICoach(config.id)}
        disabled={aiCoach.loading}
      >
        {aiCoach.aiCoachVisible[config.id] ? 'Close AI Coach' : 'AI Coach'}
      </button>

      {aiCoach.aiCoachVisible[config.id] && (
        <div className={styles.aiCoachSubMenu}>
          <div>
            <label>Potential NPS Score</label>
            <input
              type="text"
              value={aiCoach.aiCoachData[config.id]?.potentialNPS || ''}
              onChange={(e) => aiCoach.setAICoachData(prev => ({
                ...prev,
                [config.id]: {
                  ...prev[config.id],
                  potentialNPS: e.target.value
                }
              }))}
              style={{
                backgroundColor: aiCoach.getNPSColor(aiCoach.aiCoachData[config.id]?.potentialNPS || 0),
                color: 'white',
                fontWeight: 'bold',
                padding: '8px',
                border: 'none',
                borderRadius: '4px',
              }}
            />
          </div>

          <div>
            <label>Evaluations</label>
            <textarea
              ref={aiCoach.evaluationsTextareaRefs.current[config.id]}
              value={aiCoach.aiCoachData[config.id]?.evaluations || ''}
              onChange={(e) => aiCoach.setAICoachData(prev => ({
                ...prev,
                [config.id]: {
                  ...prev[config.id],
                  evaluations: e.target.value
                }
              }))}
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
              ref={aiCoach.suggestionsTextareaRefs.current[config.id]}
              value={aiCoach.aiCoachData[config.id]?.suggestions || ''}
              onChange={(e) => aiCoach.setAICoachData(prev => ({
                ...prev,
                [config.id]: {
                  ...prev[config.id],
                  suggestions: e.target.value
                }
              }))}
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
              onClick={() => aiCoach.handleCallAICoach(config.id, config.purpose, config.context)}
              disabled={aiCoach.loading}
            >
              Call AI Coach
            </button>
            <button
              className={styles.buttonSaveAICoach}
              onClick={() => {
                const potentialNPS = aiCoach.aiCoachData[config.id]?.potentialNPS;
                const evaluations = aiCoach.aiCoachData[config.id]?.evaluations;
                const suggestions = aiCoach.aiCoachData[config.id]?.suggestions;
                aiCoach.handleSaveAICoachResponse(config.id, potentialNPS, evaluations, suggestions);
              }}
              disabled={aiCoach.loading}
            >
              Save
            </button>
            {aiCoach.loading && <ClipLoader color="#09f" loading={aiCoach.loading} size={20} />}
          </div>
        </div>
      )}
    </>
  );
};

export default AICoachForm;