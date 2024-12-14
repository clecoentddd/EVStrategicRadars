import { v4 as uuidv4 } from 'uuid'; // Import the UUID generator
import { projectRadarToSupabase } from './radarProjection';
import { publishIntegrationEvent } from '../../pubAndSub/pushAndSubEvents'

const eventStore = []; // In-memory event storage

export const saveEvent = async (event) => {


  // Add aggregate_id (UUID) to the event payload

  const newtimestamp = new Date().getTime();
  const eventWithId = {
    ...event,
    payload: {
      ...event.payload,
      id: uuidv4(), // Generate a unique ID and add it as aggregate_id
      timestamp: newtimestamp,
    },
  };

  //console.log("ES1234 Event to be pushed:", eventWithId);

  eventStore.push(eventWithId); // Push the new event with the ID into the event store

  // Publish integration event
  console.log ("eventstore.js publishing events");
  try {
    publishIntegrationEvent(eventWithId);
  } catch (error) {
  console.error('Error publishing event:', error);
  // Consider additional error handling, such as retrying the operation or notifying an administrator
  }

  // If the event type is "RADAR_CREATED", project it to Supabase
  if (eventWithId.type === 'RADAR_CREATED') {
    try {
      // Project the event to Supabase
      await projectRadarToSupabase(eventWithId.payload); // Pass the payload with aggregate_id
    } catch (error) {
    //  console.log('saveEvent: Error projecting radar to Supabase:', error);
    }
  }

  // Explicitly return the saved event with the aggregate_id
  return eventWithId;
};

export const getEvents = async () => {
  // console.log("ES Fetching Events from Memory:", eventStore); // Log the fetch operation
  return [...eventStore]; // Return a copy to prevent mutation
};

export const clearEventStore = async () => {
  eventStore.length = 0; // Clear all events
 // console.log("ES Event store cleared."); // Log when the store is cleared
};

export async function getRadarByIdFromEventSource(aggregateId) {
  const events = await getEvents();
  const radarEvents = events.filter(event => event.payload.aggregate_id === aggregateId);

  // Sort events by timestamp in descending order
  radarEvents.sort((a, b) => b.payload.timestamp - a.payload.timestamp);

  // Return the latest event
  const latestEvent = radarEvents[0];

  // Reconstruct the radar state from the latest event
  const radar = latestEvent ? { ...latestEvent.payload } : {};

  return radar;
}
