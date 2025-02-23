// services/callAICoach.js
export default async function callAICoach(radarId, purpose) {
    try {
     console.log("Service callAICoach", purpose);
      const response = await fetch("/api/ai-coach", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ radarId, purpose }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const result = await response.json();
      return result.data; // Return the parsed response
    } catch (error) {
      console.error('Error calling AI Coach:', error.message);
      throw error;
    }
  }