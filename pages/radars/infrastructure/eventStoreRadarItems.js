import { v4 as uuidv4 } from "uuid"; // UUID generator for creating radar item id
import { projectRadarItemToSupabase } from './radarItemsProjection'; // Import projection function

const radarItemEvents = []; // In-memory storage for radar item events

// Save Radar Item Event (with event name)
export const saveRadarItemEvent = async (event) => {
  try {
    // Generate a unique aggregate_id (if not provided)
    const aggregate_id = event.payload.aggregate_id || uuidv4();
    console.log("EVENTSTORE event is ", event);

    // Add the generated aggregate_id to the event payload if it's not already there
    event.payload.aggregate_id = aggregate_id;

    // Add the event name to the event payload
    event.event_name = event.type || 'Unknown';  // Set event name dynamically based on type (e.g., radarItemCreated, radarItemUpdated)

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

// Fetch all Radar Item Events (for a given radar_id)
export const getRadarItemEvents= async (radar_id) => {
  // Filter radar item events by radar_id (if passed)
  const filteredEvents = radarItemEvents.filter((event) => event.payload.radar_id === radar_id);

  console.log("Fetching Radar Item Events for radar_id:", radar_id);
  console.log("Filtered Events:", filteredEvents);

  return [...filteredEvents];  // Return a copy of the filtered events
};

// Clear all Radar Item Events (for testing purposes or resetting the event store)
export const clearRadarItemEventStore = async () => {
  radarItemEvents.length = 0;
  console.log("Radar Item Event Store Cleared.");
};

// Replay events to get the last state of the radar item based on the most recent event
export const replayRadarItemState = async (aggregate_id) => {
  try {
    const events = await getRadarItemEvents(aggregate_id);  // Fetch events for the given radar_id

    if (events.length === 0) {
      return { success: false, message: `No events found for radar_id: ${aggregate_id}` };
    }

    // Sort events by timestamp or sequence (assuming events are stored in chronological order)
    events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // If events have a timestamp

    // Replay the events to get the final state
    const finalState = events.reduce((state, event) => {
      switch (event.event_name) {
        case "radarItemCreated":
          return { ...state, ...event.payload };  // Apply changes from radarItemCreated
        case "radarItemUpdated":
          return { ...state, ...event.payload };  // Apply updates from radarItemUpdated
        default:
          return state;
      }
    }, {});

    console.log("Replayed Radar Item State:", finalState);
    return { success: true, state: finalState };
  } catch (error) {
    console.error("Error replaying radar item state:", error.message);
    return { success: false, message: "Error replaying radar item state" };
  }
};
