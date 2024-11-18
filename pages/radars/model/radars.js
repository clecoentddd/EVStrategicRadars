import { v4 as uuidv4 } from 'uuid'; // Import the UUID generator
import { saveEvent, getEvents } from '../infrastructure/eventStore'; // Ensure you have access to getEvents

export async function handleRadarCreation(command) {
  console.log("Handling radar creation for:", command); // Log the received command
  const { name, description, level } = command.payload;

  // Fetch existing events to check for duplicates
  const existingRadars = await getEvents();
  console.log("MODEL Existing events:", existingRadars); // Log all existing events

  // Check for duplicates
  console.log("MODEL Check for duplicate");
  const isDuplicate = existingRadars.some((event) => {
    console.log("MODEL Duplicate? from event", event.payload.name); // Log the name from each event
    console.log("MODEL Duplicate? from input", name);
    return event.payload.name === name;
  });

  if (isDuplicate) {
    console.log("MODEL Duplicate radar name detected:", name); // Log the duplicate detection
    return { success: false, message: "Radar name must be unique" }; // Return an error response
  }

  // Generate a UUID for the new radar
  const id = uuidv4();
  console.log("MODEL Radar UUID:", id);

  // Create the radar object
  const newRadar = { id, name, description, level };

  console.log("MODEL New radar created:", newRadar); // Log the created radar

  // Save the radar creation event
  await saveEvent({ type: "CREATE_RADAR", payload: newRadar });

  // Return the UUID along with success and radar details
  return { success: true, radar: newRadar, uuid: id }; // Return the UUID as part of the response
}
