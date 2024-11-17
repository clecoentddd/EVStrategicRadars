import { v4 as uuidv4 } from 'uuid'; // Import the UUID generator

export async function handleRadarCreation(command) {
  console.log("Handling radar creation for:", command); // Log the received command

  const { name, description, level } = command.payload;

  // Check for duplicates
  const existingRadars = await getEvents();
  const isDuplicate = existingRadars.some((event) => event.payload.name === name);
toto
  if (isDuplicate) {
    console.log("MODEL Duplicate radar name detected:", name); // Log the duplicate detection
    return { success: false, message: "Radar name must be unique" }; // Return an error response
  }

  // Generate a UUID for the new radar
  const id = uuidv4();
  console.log("MODEL Radar uui:", id);

  // Create the radar object
  const newRadar = { id, name, description, level };

  console.log("MODEL New radar created:", newRadar); // Log the created radar

  // Save the radar creation event
  await saveEvent({ type: "CREATE_RADAR", payload: newRadar });

  return { success: true, radar: newRadar }; // Return the new radar
}
