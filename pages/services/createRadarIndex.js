// Service to create a radar entry into the organisation

async function createRadar(name, description, level) {
  try {
    const response = await fetch("/api/radars", {
      method: "POST",
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
    console.error("Error saving radar:", error.message);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export default createRadar;