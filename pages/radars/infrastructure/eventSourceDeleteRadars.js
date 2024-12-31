import { appendEventToFile } from './eslib.js';
import { projectRadarToSupabase2 } from './radarProjection.js'; // Import projection function
import {replayRadarAggregate} from './eventReplayRadars.js';

export const sendRadarDelete= async (event) => {


    // Add id (UUID) to the event payload
  
    const newtimestamp = new Date().getTime();
  
    console.log("EVENTSTORE event is ", event);
    
    const radarToDelete = {
    eventType: "RADAR_DELETED",
    timestamp: newtimestamp,
    aggregateType: "RADAR",
      payload: {
      id: event.radarId,
      }
    };
  
    if (replayRadarAggregate(event.radarId) === null) {
        console.log ("Radar Aggregate not found");
        return null;
    }
  
    console.log ("eventstoreRadars.js publishing events 1", radarToDelete);
  
    //eventStore.push(eventWithId); // Push the new event with the ID into the event store
    const radarDeleted = appendEventToFile(radarToDelete.payload.radarId, radarToDelete);
  
    // Publish integration event
    console.log ("eventstore.js publishing events 2", radarDeleted);
    /* try {
      publishIntegrationEvent(radarUpdated);
    } catch (error) {
    console.error('Error publishing event:', error);
    // Consider additional error handling, such as retrying the operation or notifying an administrator
    } */
  
    // If the event type is "RADAR_CREATED", project it to Supabase
    if (radarDeleted.eventType === 'RADAR_DELETED') {
      try {
        // Project the event to Supabase
        console.log("Projection radar to supabase", radarDeleted.eventType);
        await projectRadarToSupabase2(radarDeleted.eventType, radarDeleted.payload); // Pass the payload with id
      } catch (error) {
        console.log('saveEvent: Error projecting radar to Supabase:', error);
      }
    }

    // Explicitly return the saved event with the id
    return radarDeleted;
  }