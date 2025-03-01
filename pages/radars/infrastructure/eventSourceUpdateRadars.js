import { appendEventToFile, readEventsFromFile } from './eslib.js';
import { projectRadarToSupabase } from './radarProjection.js'; // Import projection function
import {replayRadarAggregate} from './eventReplayRadars.js';
import { publishIntegrationEvent } from '../../pubAndSub/pushAndSubEvents.js';

export const sendRadarUpdated = async (event) => {


    // Add id (UUID) to the event payload
  
    const newtimestamp = new Date().getTime();
  
    console.log("sendRadarUpdated:  event to store ", event);
    
    const radarToUpdate = {
    eventType: "RADAR_UPDATED",
    timestamp: newtimestamp,
    aggregateType: "RADAR",
      payload: {
      id: event.radarId,
      level: event.level,
      name: event.name,
      purpose: event.purpose,
      context: event.context,
      }
    };
  
    if (replayRadarAggregate(event.radarId) === null) {
        console.log ("sendRadarUpdated - Radar Aggregate not found", event.radarId);
        return null;
    }
  
    console.log ("eventstoreRadars.js publishing events 1", radarToUpdate);
  
    //eventStore.push(eventWithId); // Push the new event with the ID into the event store
    const radarUpdated = appendEventToFile(radarToUpdate.payload.id, radarToUpdate);
  
    // Publish integration event
    console.log('publishIntegrationEvent:', publishIntegrationEvent);
    console.log ("sendRadarUpdated: event added to source:", radarUpdated);
    try {
      publishIntegrationEvent(radarUpdated);
    } catch (error) {
    console.error('Error publishing event (updating radar):', error);
    // Consider additional error handling, such as retrying the operation or notifying an administrator
    }
  
    // If the event type is "RADAR_CREATED", project it to Supabase
    if (radarUpdated.eventType === 'RADAR_UPDATED') {
      try {
        // Project the event to Supabase
        console.log("Projection radar to supase", radarUpdated);
        await projectRadarToSupabase(radarUpdated.eventType, radarUpdated.payload); // Pass the payload with id
      } catch (error) {
        console.log('saveEvent: Error projecting radar to Supabase:', error);
      }
    }

    // Explicitly return the saved event with the id
    //const resp = await  replayRadarAggregate( radarUpdated.payload.id);
    //console.log ("sendRadarUpdated: events replayed:", resp);
    return radarUpdated;
  }