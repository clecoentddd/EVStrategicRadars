// Service to create a radar entry into the organisation

// services/updateRadarIndex.js
export default async function updateRadar(radarId, name, description, level) {
    try {
      const response = await fetch(`/api/radars-update/${radarId}`, { 
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description, level }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const result = await response.json(); 
      return result; 
    } catch (error) {
      console.error("Error updating radar:", error.message);
      throw error; 
    }
  }