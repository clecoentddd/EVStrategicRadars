import { v4 as uuidv4 } from 'uuid'; // Import the UUID generator
import { projectRadarToSupabase } from './radarProjection.js';
import { publishIntegrationEvent } from '../../pubAndSub/pushAndSubEvents.js'
import { appendEventToEventSourceDB } from './eslib.js';

const eventStore = []; // In-memory event storage

export const sendRadarCreated = async (event) => {


  // Add id (UUID) to the event payload

   console.log("EVENTSTORE event is ", event);
  
  const radarToCreate = {
    eventType: "RADAR_CREATED", // Static value for eventType
    aggregateType: "RADAR", // Static value for aggregateType
    aggregateId: uuidv4(), // Generate a UUID for aggregateId
    payload: { // JSON column with the specific fields
      name: event.name,
      level: event.level,
      purpose: event.purpose,
      context: event.context,
      created_at: new Date().getTime(), // Use the provided timestamp
    },
  };


  console.log ("eventstoreRadars.js publishing events", radarToCreate);

  //eventStore.push(eventWithId); // Push the new event with the ID into the event store
  const radarCreated = await appendEventToEventSourceDB(radarToCreate);

  // Publish integration event
  if (radarCreated) {
    try {
      publishIntegrationEvent(radarCreated);
      console.info('Event published successfully:', radarCreated);
    } catch (error) {
      console.error('Error publishing event:', error);
    }
  } else {
    console.warn('radarCreated is undefined or null. Skipping event publishing.');
  }

  // If the event type is "RADAR_CREATED", project it to Supabase
  if (radarCreated.eventType === 'RADAR_CREATED') {
    try {
      // Project the event to Supabase
      console.log("Projection radar to supase - Create", radarCreated.eventType);
      await projectRadarToSupabase(radarCreated); // Pass the payload with id
    } catch (error) {
      console.log('saveEvent: Error projecting radar to Supabase:', error);
    }
  }

  // Explicitly return the saved event with the id
  console.log("sendRadarCreated returning", radarCreated);
  return radarCreated;
};

export const getEvents = async () => {
  // console.log("ES Fetching Events from Memory:", eventStore); // Log the fetch operation
  return [...eventStore]; // Return a copy to prevent mutation
};

export const clearEventStore = async () => {
  eventStore.length = 0; // Clear all events
 // console.log("ES Event store cleared."); // Log when the store is cleared
};

