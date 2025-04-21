import { sendOrganisationCreated, getEvents } from '../infrastructure/eventStoreCreateOrganisation'; // Ensure you have access to getEvents

export async function handleRadarCreation(command) {
  console.log("Handling radar creation for:", command); // Log the received command
  
  const { name, purpose, level } = command.payload;

  console.log("Handling radar creation for name is:", level); // Log the received command
  
  if (!name || !purpose || !(typeof level === 'number' && level >= 0)) {
    console.log("handleRadarCreation: Mandatory fields are missing");
    return { success: false, message: "Mandatory fields are missing" };
  }

  console.log("Handling radar creation for name is:", name); // Log the received command
  

   // Save the radar creation event
  let savedEvent;
  try {
    console.log("handleRadarCreation: Creating Radar: calling sendOrganisationCreated:",command);
    savedEvent = await sendOrganisationCreated({ ...command.payload });
    // console.log("MODEL123 SaveEvent created:",savedEvent);
} catch (error) {
    console.error("handleRadarCreation: Error in saveEvent:", error.message);
    throw new Error("handleRadarCreation: Failed to save new radar");
  }
  
  // Return the result including the generated UUID from the event store
  // console.log("MODEL HandleRadarCreation - return SavedEvent.payload:",savedEvent.payload);
  return { 
    success: true, 
    radar: {
      id: savedEvent.aggregateId, // Key-value pair
      ...savedEvent.payload    // Key-value pair
    }
  };
}
