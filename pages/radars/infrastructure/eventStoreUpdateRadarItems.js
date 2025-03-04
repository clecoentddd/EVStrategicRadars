import { v4 as uuidv4 } from "uuid"; // UUID generator for creating radar item id
import { projectRadarItemToSupabase } from './radarItemsProjection'; // Import projection function
import {appendEventToRadatIemEventSourceDB} from './eslib';

const radarItemEvents = []; // In-memory storage for radar item events

// Save Radar Item Event (with event name)
export const saveRadarItemEvent = async (event) => {
  try {
    // Generate a unique id (if not provided)
    console.log("EVENTSTORE event is ", event);
    if (event.event === "RADAR_ITEM_CREATED") {
    event.payload.id = uuidv4();
  };
    
    
  console.log("EVENTSTORE event is ", event.aggregateId);
    // Add timestamp
    event.created_at = new Date().getTime();

    console.log("Current Radar Item Events in Memory - eventType:", eventType);

    // Save the event in memory
    // radarItemEvents.push(event);
    const eventReturned = appendEventToRadatIemEventSourceDB(event);

    console.log("Radar Item Event saved:", eventReturned);
    console.log("Current Radar Item Events in Memory:", radarItemEvents);

    // Project the radar item to Supabase - don't wait
    const projectionResult = projectRadarItemToSupabase(event.payload); // Pass the payload to the projection function
    
    const aggregate = {
      ...event.payload, // Use the payload of the latest event to construct the state
    };

    console.log ("ES: Aggregate created or saved is" , aggregate)
    return { success: true, ...aggregate };
    

  } catch (error) {
    console.error("Error saving radar item event:", error.message);
    return { success: false, message: "Error saving radar item event" };
  }
};
