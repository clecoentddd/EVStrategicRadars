import { useState, useRef, useEffect } from 'react';
import callAICoach from './services/callAICoach';
import saveAICoachResponse from './services/saveAICoachResponse'; // Import the new service
import retrieveAICoachResponse from './services/retrieveAICoachResponse';


// Custom hook for AI Coaching logic
const useAICoach = () => {
  // State for AI Coach visibility and data
  const [aiCoachVisible, setAICoachVisible] = useState({});
  const [aiCoachData, setAICoachData] = useState({});
  const [callingLoading, setCallingLoading] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);

  // Refs for auto-resizing textareas
  const evaluationsTextareaRefs = useRef({});
  const suggestionsTextareaRefs = useRef({});

  // Function to auto-resize textareas
  const autoResizeTextarea = (textareaRef) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Effect to auto-resize textareas when AI Coach data changes
  useEffect(() => {
    Object.keys(aiCoachData).forEach((radarId) => {
      if (evaluationsTextareaRefs.current[radarId]) {
        autoResizeTextarea(evaluationsTextareaRefs.current[radarId]);
      }
      if (suggestionsTextareaRefs.current[radarId]) {
        autoResizeTextarea(suggestionsTextareaRefs.current[radarId]);
      }
    });
  }, [aiCoachData]);


  // Handle "Call AI Coach" button click
  const handleCallAICoach = async (radarId, purpose, context) => {
    try {
      setCallingLoading(true); // Show the spinner

      const response = await callAICoach(radarId, purpose, context);
      console.log('AI Coach Response:', response);

      // Update the state for the specific radar
      setAICoachData((prev) => ({
        ...prev,
        [radarId]: {
          potentialNPS: response.potentialNPS || '',
          evaluations: response.evaluations || '',
          suggestions: response.suggestions || '',
        },
      }));
    } catch (error) {
      console.error('Error calling AI Coach:', error.message);
      alert('Failed to call AI Coach. Please try again.');
    } finally {
      setCallingLoading(false); // Hide the spinner
    }
  };

  // Handle "Save AI Coach Response" button click
  const handleSaveAICoachResponse = async (radarId, potentialNPS, evaluations, suggestions) => {
    try {
      setSavingLoading(true); // Show the spinner
      console.log('handleSaveAICoachResponse', radarId);
  
      // Ensure all required fields are present
      if (!radarId || !potentialNPS || !evaluations || !suggestions) {
        throw new Error('Missing required fields: potentialNPS, evaluations, or suggestions.');
      }
  
      // Call the save function
      const response = await saveAICoachResponse(radarId, potentialNPS, evaluations, suggestions);
  
      console.log('Data saved successfully:', response);
    } catch (error) {
      console.error('Error saving data:', error.message);
      alert('Failed to save data. Please try again.');
    } finally {
      setSavingLoading(false); // Hide the spinner
    }
  };

const handleRetrieveAICoachResponse = async (radarId, setCallingLoading, setAICoachData) => {
  try {
    setCallingLoading(true); // Show the spinner
    console.log('handleRetrieveAICoachResponse', radarId);

    // Call the retrieve function
    const response = await retrieveAICoachResponse(radarId);

    // Update the state with the retrieved data
    if (response.data) {
      setAICoachData((prev) => ({
        ...prev,
        [radarId]: {
          potentialNPS: response.data.potentialNPS || '',
          evaluations: response.data.evaluations || '',
          suggestions: response.data.suggestions || '',
        },
      }));
    }

    console.log('Data retrieved successfully:', response);
  } catch (error) {
    console.error('Error retrieving data:', error.message);
    alert('Failed to retrieve data. Please try again.');
  } finally {
    setLoading(false); // Hide the spinner
  }
};

  // Toggle AI Coach sub-menu visibility
  const toggleAICoach = async (radarId) => {
    // Toggle the visibility of the AI Coach sub-menu
    setAICoachVisible((prev) => ({
      ...prev,
      [radarId]: !prev[radarId],
    }));
  
    // If the sub-menu is being opened, fetch the latest AI Coach data
    if (!aiCoachVisible[radarId]) {
      await handleRetrieveAICoachResponse(radarId, setLoading, setAICoachData);
    }
  };

  // Manage NPS score color
  const getNPSColor = (nps) => {
    if (nps > 4.5) return 'darkgreen';
    if (nps > 4) return 'green';
    if (nps > 3.5) return 'lightgreen';
    if (nps > 3) return 'orange';
    if (nps > 2.5) return 'darkorange';
    if (nps >= 0) return 'red';
    return 'white'; // default value
  };

  return {
    aiCoachVisible,
    aiCoachData,
    evaluationsTextareaRefs,
    suggestionsTextareaRefs,
    toggleAICoach,
    handleCallAICoach,
    handleSaveAICoachResponse,
    getNPSColor,
    callingLoading,
    savingLoading,
  };
};

export default useAICoach;