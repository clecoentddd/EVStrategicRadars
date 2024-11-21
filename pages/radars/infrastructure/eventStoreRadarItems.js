import { v4 as uuidv4 } from "uuid"; // UUID generator for creating radar item id
import { projectRadarItemToSupabase } from './radarItemsProjection'; // Import projection function

const radarItemEvents = []; // In-memory storage for radar item events

export const saveRadarItemEvent = async (event) => {
  try {
    // Generate a unique aggregate_id
    const aggregate_id = uuidv4();

    // Add the generated aggregate_id to the event payload
    event.payload.aggregate_id = aggregate_id;

    // Save the event in memory
    radarItemEvents.push(event);

    console.log("Radar Item Event saved:", event);
    console.log("Current Radar Item Events in Memory:", radarItemEvents);

    // Project the radar item to Supabase
    try {
      const projectionResult = await projectRadarItemToSupabase(event.payload); // Pass the payload to the projection function
      return { success: true, message: "Projection Radar item created and projected successfully", radarItem: event.payload, projectionResult };
    } catch (error) {
      console.error("Projection Error projecting radar item to Supabase:", error.message);
      return { success: false, message: "Projection Error projecting radar item to Supabase" };
    }
  } catch (error) {
    console.error("Error saving radar item event:", error.message);
    return { success: false, message: "Error saving radar item event" };
  }
};

export const getRadarItemEvents = async () => {
  console.log("Fetching Radar Item Events from Memory:", radarItemEvents);
  return [...radarItemEvents];
};

export const clearRadarItemEventStore = async () => {
  radarItemEvents.length = 0;
  console.log("Radar Item Event Store Cleared.");
};