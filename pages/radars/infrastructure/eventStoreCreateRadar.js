import { v4 as uuidv4 } from 'uuid'; // Import the UUID generator
import { projectRadarToSupabase } from './radarProjection.js';
import { publishIntegrationEvent } from '../../pubAndSub/pushAndSubEvents.js'
import { appendEventToFile, readEventsFromFile } from './eslib.js';

const eventStore = []; // In-memory event storage

export const sendRadarCreated = async (event) => {


  // Add id (UUID) to the event payload

  const newtimestamp = new Date().getTime();

  console.log("EVENTSTORE event is ", event);
  
  const radarToCreate = {
  eventType: "RADAR_CREATED",
  timestamp: newtimestamp,
  aggregateType: "RADAR",
    payload: {
    level: event.level,
    name: event.name,
    purpose: event.purpose,
    id: uuidv4(),
    }
  };


  console.log ("eventstoreRadars.js publishing events 1", radarToCreate);

  //eventStore.push(eventWithId); // Push the new event with the ID into the event store
  const radarCreated = appendEventToFile(radarToCreate.payload.id, radarToCreate);

  // Publish integration event
  console.log ("eventstore.js publishing events", radarCreated);
  try {
    publishIntegrationEvent(radarCreated);
  } catch (error) {
  console.error('Error publishing event:', error);
  // Consider additional error handling, such as retrying the operation or notifying an administrator
  }

  // If the event type is "RADAR_CREATED", project it to Supabase
  if (radarCreated.eventType === 'RADAR_CREATED') {
    try {
      // Project the event to Supabase
      console.log("Projection radar to supase - Create", radarCreated.eventType);
      await projectRadarToSupabase(radarCreated.eventType, radarCreated.payload); // Pass the payload with id
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

