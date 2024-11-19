// pages/radars/infrastructure/eventStore.js
import { projectRadarToSupabase } from './radarProjection';

const eventStore = []; // In-memory event storage

export const saveEvent = async (event) => {
  eventStore.push(event); // Push the new event into the event store

  // Log the event being saved and the current state of the event store
  console.log("ES1 Event saved:", event);
  console.log("ES1 Current Events in Memory after saving:", eventStore); // Log all stored events after saving
  console.log("ES1 Event type:", event.type);

  // If the event type is "CREATE_RADAR", project it to Supabase
  if (event.type === 'CREATE_RADAR') {
    try {
      // await testConnection();
      await projectRadarToSupabase(event.payload); // Project to Supabase
    } catch (error) {
      console.log("ES3 Event type:", event.type);
      console.log('ES3 Error projecting radar to Supabase:', error);
    }
  }
};

export const getEvents = async () => {
  console.log("ES Fetching Events from Memory:", eventStore); // Log the fetch operation
  return [...eventStore]; // Return a copy to prevent mutation
};

export const clearEventStore = async () => {
  eventStore.length = 0; // Clear all events
  console.log("ES Event store cleared."); // Log when the store is cleared
};
