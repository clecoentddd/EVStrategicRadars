import { sendOrganisationCreated, getEvents } from '../infrastructure/eventStoreRadars.js.deprecated'; // Ensure you have access to getEvents

export async function handleRadarCreation(command) {
  // console.log("Handling radar creation for:", command); // Log the received command
  const { name, purpose, level } = command.payload;
  
  if (!name || !purpose || !level) {
    return { success: false, message: "Mandatory fields are missing" };
  }

  //console.log("MODEL123 New radar created (before event store):", newRadar); // Log the radar object before storing

  // Save the radar creation event
  let savedEvent;
  try {
    console.log("MODEL Creating Radar: calling sendOrganisationCreated:",command);
    savedEvent = await sendOrganisationCreated({ ...command.payload });
    // console.log("MODEL123 SaveEvent created:",savedEvent);
} catch (error) {
    console.error("Error in saveEvent:", error.message);
    throw new Error("Failed to save new radar");
  }
  
  // Return the result including the generated UUID from the event store
  // console.log("MODEL HandleRadarCreation - return SavedEvent.payload:",savedEvent.payload);
  return { success: true, radar: savedEvent.payload };
}
