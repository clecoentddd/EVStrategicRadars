// pages/radars/model/radars.js
export async function handleRadarCreation(command) {
  console.log("Handling radar creation for:", command);  // Log received command

  // Simulate checking for duplicate radar names (mock logic)
  const existingRadars = ['CEO1'];  // This should come from your data source (e.g., database)

  if (existingRadars.includes(command.payload.name)) {
    console.log("Duplicate radar name detected:", command.payload.name);  // Log the duplicate detection
    // Return an error response directly
    return { success: false, message: "Radar name must be unique" };
  }

  // Create the radar (mock logic)
  const newRadar = {
    name: command.payload.name,
    description: command.payload.description,
    level: command.payload.level,
  };

  console.log("New radar created:", newRadar);  // Log created radar details

  return { success: true, radar: newRadar };
}
