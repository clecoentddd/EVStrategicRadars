import { appendEventToFile, readEventsFromFile } from './eslib.js';
import { projectRadarToSupabase } from './radarProjection.js'; // Import projection function
import {replayRadarAggregate} from './eventReplayRadars.js';

export const sendRadarUpdated = async (event) => {


    // Add id (UUID) to the event payload
  
    const newtimestamp = new Date().getTime();
  
    console.log("EVENTSTORE event is ", event);
    
    const radarToUpdate = {
    eventType: "RADAR_UPDATED",
    timestamp: newtimestamp,
    aggregateType: "RADAR",
      payload: {
      radarId: event.radarId,
      level: event.level,
      name: event.name,
      description: event.description,
      }
    };
  
    if (replayRadarAggregate(event.radarId) === null) {
        console.log ("Radar Aggregate not found");
        return null;
    }
  
    console.log ("eventstoreRadars.js publishing events 1", radarToUpdate);
  
    //eventStore.push(eventWithId); // Push the new event with the ID into the event store
    const radarUpdated = appendEventToFile(radarToUpdate.payload.radarId, radarToUpdate);
  
    // Publish integration event
    console.log ("eventstore.js publishing events", radarUpdated);
    /* try {
      publishIntegrationEvent(radarUpdated);
    } catch (error) {
    console.error('Error publishing event:', error);
    // Consider additional error handling, such as retrying the operation or notifying an administrator
    } */
  
    // If the event type is "RADAR_CREATED", project it to Supabase
    if (radarUpdated.eventType === 'RADAR_UPDATED') {
      try {
        // Project the event to Supabase
        console.log("Projection radar to supase", radarUpdated.eventType);
        await projectRadarToSupabase(radarUpdated.payload); // Pass the payload with id
      } catch (error) {
        console.log('saveEvent: Error projecting radar to Supabase:', error);
      }
    }

    // Explicitly return the saved event with the id
    return radarUpdated;
  }