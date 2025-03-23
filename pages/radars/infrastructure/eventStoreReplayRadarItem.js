import { v4 as uuidv4 } from "uuid"; // UUID generator for creating radar item id
import { projectRadarItemToSupabase } from './radarItemsProjection'; // Import projection function
import {getEventsForRadarItem} from './eslib';

const radarItemEvents = []; // In-memory storage for radar item events

// Clear all Radar Item Events (for testing purposes or resetting the event store)
export const clearRadarItemEventStore = async () => {
  radarItemEvents.length = 0;
  console.log("Radar Item Event Store Cleared.");
};

// Replay events to get the last state of the radar item based on the most recent event
export const replayRadarItemState = async (radarItemId) => {
  try {
    // Fetch events for the given id
    const events = await getEventsForRadarItem(radarItemId);

    if (!events || events.length === 0) {
      return { success: false, message: `No events found for id: ${radarItemId}` };
    }

    console.log("ES: Events to replay", events);

    const latestEvent = events.reduce((latest, current) => {
      console.log('Current event:', current);
      console.log('Latest event so far:', latest);
      console.log('Comparing timestamps:', current.payload.timestamp, '>', latest.payload.timestamp);
    
      return current.payload.timestamp > latest.payload.timestamp ? current : latest;
    }, events[0]);
    
    console.log('Final latest event:', latestEvent);
 
    // Hydrate the aggregate using the latest event's payload
    const hydratedAggregate = {
      radarItemId, // Ensure the id is part of the state
      ...latestEvent.payload, // Use the payload of the latest event to construct the state          
    };

    console.log("Hydrated Radar Item Aggregate:", hydratedAggregate);

    return { success: true, ...hydratedAggregate };
  } catch (error) {
    console.error("Error replaying radar item state:", error.message);
    return { success: false, message: "Error replaying radar item state" };
  }
};
