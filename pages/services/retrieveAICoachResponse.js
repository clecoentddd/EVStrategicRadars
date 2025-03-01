export default async function retrieveAICoachResponse (radarId) {
    try {
      const response = await fetch(`/api/ai-coach-saving-nps?radarId=${radarId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Retrieved AI Coach Response:', data);
      return data;
    } catch (error) {
      console.error('Error retrieving AI Coach response:', error.message);
      throw error;
    }
  };