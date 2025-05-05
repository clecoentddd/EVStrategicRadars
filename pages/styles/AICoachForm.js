import React, { useEffect, useRef } from 'react';
import styles from './AICoachForm.module.css';
import { ClipLoader } from 'react-spinners';

const AICoachForm = ({ config, aiCoach }) => {
  // Init refs

  const formContainerRef = useRef(null);

  aiCoach.evaluationsTextareaRefs.current[config.id] = 
    aiCoach.evaluationsTextareaRefs.current[config.id] || React.createRef();
  aiCoach.suggestionsTextareaRefs.current[config.id] = 
    aiCoach.suggestionsTextareaRefs.current[config.id] || React.createRef();

  useEffect(() => {
    if (aiCoach.aiCoachVisible[config.id]) {
      const resize = (ref) => {
        if (ref.current) {
          ref.current.style.height = 'auto';
          ref.current.style.height = `${ref.current.scrollHeight}px`;
        }
      };
      resize(aiCoach.evaluationsTextareaRefs.current[config.id]);
      resize(aiCoach.suggestionsTextareaRefs.current[config.id]);

      if (formContainerRef.current) {
        formContainerRef.current.scrollTop = 0;
      }
    }

  }, [aiCoach.aiCoachData, aiCoach.aiCoachVisible]);

  return (
    <div className={styles.aiCoachForm}>
      <h2>AI Coach for: {config.name}</h2>

      <div className={styles.formRow}>
        <label>Potential NPS Score</label>
        <input
          type="text"
          value={aiCoach.aiCoachData[config.id]?.potentialNPS || ''}
          readOnly
          className={styles.npsInput}
          style={{
            backgroundColor: aiCoach.getNPSColor(aiCoach.aiCoachData[config.id]?.potentialNPS || 0),
            color: 'white'
          }}
        />
      </div>

      <div className={styles.formRow}>
        <label>Evaluations</label>
        <textarea
          ref={aiCoach.evaluationsTextareaRefs.current[config.id]}
          value={aiCoach.aiCoachData[config.id]?.evaluations || ''}
          readOnly
          className={styles.textarea}
        />
      </div>

      <div className={styles.formRow}>
        <label>Suggestions</label>
        <textarea
          ref={aiCoach.suggestionsTextareaRefs.current[config.id]}
          value={aiCoach.aiCoachData[config.id]?.suggestions || ''}
          readOnly
          className={styles.textarea}
        />
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={styles.primaryButton}
          onClick={() =>
            aiCoach.handleCallAICoach(config.id, config.purpose, config.context)
          }
          disabled={aiCoach.loading}
        >
          {aiCoach.loading ? <ClipLoader color="#fff" size={15} /> : 'Call AI Coach'}
        </button>

        <button
          className={styles.secondaryButton}
          onClick={() => {
            const { potentialNPS, evaluations, suggestions } = aiCoach.aiCoachData[config.id] || {};
            aiCoach.handleSaveAICoachResponse(config.id, potentialNPS, evaluations, suggestions);
          }}
          disabled={aiCoach.loading}
        >
          Save
        </button>

        <button
          type="button"
          className={styles.cancelButton}
          onClick={() => aiCoach.toggleAICoach(config.id)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AICoachForm;
