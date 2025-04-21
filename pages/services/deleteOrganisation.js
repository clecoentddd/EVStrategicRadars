// Service to create a radar entry into the organisation

// services/updateRadarIndex.js
export default async function deleteOrganisation(radarId) {
    try {
      const response = await fetch(`/api/organisation-delete?${radarId}`, { 
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
      console.log("Services: deleteOrganisation response is", result);
      return response; 
    } catch (error) {
      console.error("Error deleting radar:", error.message);
      throw error; 
    }
  }