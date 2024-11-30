import { saveEvent, getEvents } from '../infrastructure/eventStore'; // Ensure you have access to getEvents

export async function handleRadarCreation(command) {
  // console.log("Handling radar creation for:", command); // Log the received command
  const { name, description, level } = command.payload;
  
  // Fetch existing events to check for duplicates
  const existingRadars = await getEvents();
  //console.log("MODEL Existing events:", existingRadars); // Log all existing events

  // Check for duplicates
  //console.log("MODEL Check for duplicate");
  const isDuplicate = existingRadars.some((event) => {
    //console.log("MODEL Duplicate? from event", event.payload.name); // Log the name from each event
    //console.log("MODEL Duplicate? from input", name);
    return event.payload.name === name;
  });

  if (isDuplicate) {
    // console.log("MODEL Duplicate radar name detected:", name); // Log the duplicate detection
    return { success: false, message: "Radar name must be unique" }; // Return an error response
  }

  //console.log("MODEL123 New radar to create now");
  // Create the radar object (without UUID, which will be added in eventStore.js)
  const status = "Created"
  const newRadar = { name, description, level, status };

  //console.log("MODEL123 New radar created (before event store):", newRadar); // Log the radar object before storing

  // Save the radar creation event
  let savedEvent;
  try {
    // console.log("MODEL123 about to create SaveEvent::",savedEvent);
    savedEvent = await saveEvent({ type: "RADAR_CREATED", payload: newRadar });
    // console.log("MODEL123 SaveEvent created:",savedEvent);
} catch (error) {
    // console.error("Error in saveEvent:", error.message);
    throw new Error("Failed to save event");
  }
  
  // Return the result including the generated UUID from the event store
  // console.log("MODEL HandleRadarCreation - return SavedEvent.payload:",savedEvent.payload);
  return { success: true, radar: savedEvent.payload };
}
