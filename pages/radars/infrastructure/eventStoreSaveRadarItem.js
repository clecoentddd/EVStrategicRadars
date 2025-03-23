import { v4 as uuidv4 } from "uuid"; // UUID generator for creating radar item id
import { projectRadarItemToSupabase } from './radarItemsProjection'; // Import projection function
import {appendEventToEventSourceDB} from './eslib';

const radarItemEvents = []; // In-memory storage for radar item events

// Save Radar Item Event (with event name)
export const sendRadarItemSaveEvent = async (event) => {
  try {
      
    
  console.log("EVENTSTORE event is ", event);

  const eventReturned = await appendEventToEventSourceDB(event);

  console.log("Radar Item Event saved:", eventReturned);
  console.log("Current Radar Item Events in Memory:", radarItemEvents);

  // Project the radar item to Supabase - don't wait
  const projectionResult = projectRadarItemToSupabase(event); // Pass the payload to the projection function
    
  console.log ("ES: Aggregate created or saved is" , projectionResult)
  return { success: true, ...eventReturned };
    

  } catch (error) {
    console.error("Error saving radar item event:", error.message);
    return { success: false, message: "Error saving radar item event" };
  }
};
