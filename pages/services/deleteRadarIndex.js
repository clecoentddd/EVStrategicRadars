// Service to create a radar entry into the organisation

// services/updateRadarIndex.js
export default async function deleteRadar(radarId) {
    try {
      const response = await fetch(`/api/radars-delete?${radarId}`, { 
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ radarId }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const result = await response.json(); 
      console.log("Services: deleteRadar response is", result);
      return response; 
    } catch (error) {
      console.error("Error deleting radar:", error.message);
      throw error; 
    }
  }