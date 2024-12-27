import {sendRadarDelete} from '../infrastructure/eventSourceDeleteRadars';

export async function handleRadarDelete(command) {
  // console.log("Handling radar creation for:", command); // Log the received command
  const { radarId} = command.payload;
 
  //console.log("MODEL123 New radar to create now");
  // Create the radar object (without UUID, which will be added in eventStore.js)

  if (!radarId) {
    return { success: false, message: "handleRadarDelete: Mandatory fields are missing (radar Id)" };
  }

  // Save the radar creation event
  let savedEvent;
  try {
    console.log("handleRadarDelete: Updating Radar: calling sendRadarCreated:",command);
    savedEvent = await sendRadarDelete({ ...command.payload });
    console.log("return { success: true, radar: savedEvent.payload }; SaveEvent created:",savedEvent);
} catch (error) {
    console.error("handleRadarDelete: Error in saveEvent:", error.message);
    throw new Error("handleRadarDelete: Failed to save new radar");
  }
  
  // Return the result including the generated UUID from the event store
  // console.log("MODEL HandleRadarCreation - return SavedEvent.payload:",savedEvent.payload);
  return { success: true, radar: savedEvent.payload };
}