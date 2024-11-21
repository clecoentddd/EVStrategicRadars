import { v4 as uuidv4 } from 'uuid'; // Import the UUID generator
import { projectRadarToSupabase } from './radarProjection';

const eventStore = []; // In-memory event storage

export const saveEvent = async (event) => {
  // Add aggregate_id (UUID) to the event payload
  const eventWithId = {
    ...event,
    payload: {
      ...event.payload,
      aggregate_id: uuidv4(), // Generate a unique ID and add it as aggregate_id
    },
  };

  console.log("ES1234 Event to be pushed:", eventWithId);

  eventStore.push(eventWithId); // Push the new event with the ID into the event store

  // If the event type is "CREATE_RADAR", project it to Supabase
  if (eventWithId.type === 'CREATE_RADAR') {
    try {
      // Project the event to Supabase
      await projectRadarToSupabase(eventWithId.payload); // Pass the payload with aggregate_id
    } catch (error) {
      console.log('saveEvent: Error projecting radar to Supabase:', error);
    }
  }

  // Explicitly return the saved event with the aggregate_id
  return eventWithId;
};

export const getEvents = async () => {
  console.log("ES Fetching Events from Memory:", eventStore); // Log the fetch operation
  return [...eventStore]; // Return a copy to prevent mutation
};

export const clearEventStore = async () => {
  eventStore.length = 0; // Clear all events
  console.log("ES Event store cleared."); // Log when the store is cleared
};
