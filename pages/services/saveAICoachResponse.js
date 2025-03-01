export default async function saveAICoachResponse (radarId, potentialNPS, evaluations, suggestions) {
  console.log('saveAICoachResponse', potentialNPS);
  try {
    const response = await fetch('/api/ai-coach-saving-nps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        radarId: radarId,
        potentialNPS: potentialNPS,
        evaluations: evaluations,
        suggestions: suggestions,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error saving data to Supabase:', error.message);
    throw error;
  }
};