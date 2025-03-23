// Service to create a radar entry into the organisation

// services/updateRadarIndex.js
export default async function updateRadar(radarId, name, purpose, context, level) {
    try {
      const response = await fetch(`/api/radars-update?${radarId}`, { 
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ radarId, name, purpose, context, level }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log("Raw Response from API updating radar", response);
      const data = await response.json(); 
      console.log("Response from API updating radar:", data.result);
      return data.result.radar; 
    } catch (error) {
      console.error("updateRadar - Error updating radar:", error.message);
      throw error; 
    }
  }