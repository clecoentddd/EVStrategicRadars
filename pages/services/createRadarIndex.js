// Service to create a radar entry into the organisation

async function createRadar(name, purpose, level) {
  try {
    const response = await fetch("/api/radars", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, purpose, level }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    console.log("createRadarIndex.js radar:", data.result);

    if (data.message === 'Successful') { 
      // Directly return the radar object from the data.result
      return data.result.radar; 
    } else {
      throw new Error('Unexpected response from server');
    }
  } catch (error) {
    console.error("Error creating radar:", error.message);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export default createRadar;