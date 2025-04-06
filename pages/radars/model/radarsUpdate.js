import {sendRadarUpdated} from '../infrastructure/eventSourceUpdateRadars';

export async function handleRadarUpdate(command) {
  // console.log("Handling radar creation for:", command); // Log the received command
  const { radarId, name, purpose, context, level } = command.payload;
 
  console.log("MODEL123 Radar to update now", command.payload);
  // Create the radar object (without UUID, which will be added in eventStore.js)

  if (!radarId  || !name || !purpose || typeof level !== "number") {
    return { success: false, message: "Mandatory fields are missing" };
  }

  // Save the radar creation event
  let savedEvent;
  try {
    console.log("MODEL Updating Radar: calling sendRadarCreated:",command);
    savedEvent = await sendRadarUpdated({ ...command.payload });
    console.log("MODEL123 SaveEvent saved:",savedEvent);
} catch (error) {
    console.error("Error in saveEvent:", error.message);
    throw new Error("Failed to save new radar");
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