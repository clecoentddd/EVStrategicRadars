import { v4 as uuidv4 } from "uuid"; // UUID generator for creating radar item id
import { projectRadarItemToSupabase } from './radarItemsProjection'; // Import projection function

const radarItemEvents = []; // In-memory storage for radar item events

// Save Radar Item Event (with event name)
export const saveRadarItemEvent = async (event) => {
  try {
    // Generate a unique aggregate_id (if not provided)
    const aggregate_id = event.payload.aggregate_id || uuidv4();
    const distance = event.payload.distance
    
    console.log("EVENTSTORE event is ", distance);
    console.log("EVENTSTORE event is ", event);

    // Add the generated aggregate_id to the event payload if it's not already there
    event.payload.aggregate_id = aggregate_id;

    // Add the event name to the event payload
    event.event_name = event.type || 'Unknown';  // Set event name dynamically based on type (e.g., radarItemCreated, radarItemUpdated)

    // Add timestamp
    event.timestamp = new Date().getTime();

    console.log("Current Radar Item Events in Memory - Timestamp:", event.timestamp);

    // Save the event in memory
    radarItemEvents.push(event);

    console.log("Radar Item Event saved:", event);
    console.log("Current Radar Item Events in Memory:", radarItemEvents);

    // Project the radar item to Supabase - don't wait
    const projectionResult = projectRadarItemToSupabase(event.payload); // Pass the payload to the projection function
    
    const aggregate = {
      ...eventvent.payload, // Use the payload of the latest event to construct the state
    };

    console.log ("ES: Aggregate created or saved is" , aggregate)
    return { success: true, ...aggregate };
    

  } catch (error) {
    console.error("Error saving radar item event:", error.message);
    return { success: false, message: "Error saving radar item event" };
  }
};

// Fetch all Radar Item Events (for a given radar_id)
export const getRadarItemEvents= async (aggregate_id) => {
  // Filter radar item events by radar_id (if passed)

  console.log("ES: get all events for aggregate_id", aggregate_id)

  const filteredEvents = radarItemEvents.filter((event) => event.payload.aggregate_id === aggregate_id);

  console.log("Fetching Radar Item Events for radar_id:", aggregate_id);
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
    // Fetch events for the given aggregate_id
    const events = await getRadarItemEvents(aggregate_id);

    if (!events || events.length === 0) {
      return { success: false, message: `No events found for aggregate_id: ${aggregate_id}` };
    }

    console.log("ES: Events to replay", events);

    // Identify the latest event based on timestamp or sequence
    const latestEvent = events.reduce((latest, current) => {
      // Assuming 'timestamp' is the property representing the event time
      return current.timestamp > latest.timestamp ? current : latest;
    }, events[0]); // Initial value is the first event
 
    console.log("Latest Event for Hydration:", latestEvent);

    // Hydrate the aggregate using the latest event's payload
    const hydratedAggregate = {
      ...latestEvent.payload, // Use the payload of the latest event to construct the state
      aggregate_id,           // Ensure the aggregate_id is part of the state
    };

    console.log("Hydrated Radar Item Aggregate:", hydratedAggregate);

    return { success: true, ...hydratedAggregate };
  } catch (error) {
    console.error("Error replaying radar item state:", error.message);
    return { success: false, message: "Error replaying radar item state" };
  }
};
