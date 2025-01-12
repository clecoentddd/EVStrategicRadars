import {sendRadarUpdated} from '../infrastructure/eventSourceUpdateRadars';

export async function handleRadarUpdate(command) {
  // console.log("Handling radar creation for:", command); // Log the received command
  const { radarId, name, purpose, level } = command.payload;
 
  //console.log("MODEL123 New radar to create now");
  // Create the radar object (without UUID, which will be added in eventStore.js)

  if (!radarId  || !name || !purpose || !level) {
    return { success: false, message: "Mandatory fields are missing" };
  }

  // Save the radar creation event
  let savedEvent;
  try {
    console.log("MODEL Updating Radar: calling sendRadarCreated:",command);
    savedEvent = await sendRadarUpdated({ ...command.payload });
    // console.log("MODEL123 SaveEvent created:",savedEvent);
} catch (error) {
    console.error("Error in saveEvent:", error.message);
    throw new Error("Failed to save new radar");
  }
  
  // Return the result including the generated UUID from the event store
  // console.log("MODEL HandleRadarCreation - return SavedEvent.payload:",savedEvent.payload);
  return { success: true, radar: savedEvent.payload };
}