import { appendEventToEventSourceDB, readEventsFromFile } from './eslib.js';
import { projectRadarToSupabase } from './radarProjection.js'; // Import projection function
import {replayRadarAggregate} from './eventReplayRadars.js';
import { publishIntegrationEvent } from '../../pubAndSub/pushAndSubEvents.js';

export const sendRadarUpdated = async (event) => {


    // Add id (UUID) to the event payload
  
    const newtimestamp = new Date().getTime();
  
    console.log("sendRadarUpdated:  event to store ", event);
    
    const radarToUpdate = {
      eventType: "RADAR_UPDATED", // Static value for eventType
      aggregateType: "RADAR", // Static value for aggregateType
      aggregateId: event.radarId, // Generate a UUID for aggregateId
      payload: { // JSON column with the specific fields
        name: event.name,
        level: event.level,
        purpose: event.purpose,
        context: event.context,
        created_at: new Date().getTime(), // Use the provided timestamp
      },
    };
  
  console.log("About to replay radar aggregate", event.radarId);

    try {

      // Store the result of replayRadarAggregate
      const result = await replayRadarAggregate(event.radarId);

      // Check if the result is null
      if (result === null) {
        console.log("sendRadarUpdated - Radar Aggregate not found", event.radarId);
        return null;
      }

      // Log the result for debugging
      console.log("Replay successful. Result:", result);

    } catch (error) {
      // Handle any errors that occur during replayRadarAggregate
      console.error("Error replaying radar aggregate:", error);

      // Optionally, you can return a specific error object or rethrow the error
      return { success: false, message: "Failed to replay radar aggregate", error: error.message };
    }
  
    console.log ("eventstoreRadars.js publishing events", radarToUpdate);
  
    //eventStore.push(eventWithId); // Push the new event with the ID into the event store
    const radarUpdated = await appendEventToEventSourceDB(radarToUpdate);
  
    // Publish integration event
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
        await projectRadarToSupabase(radarUpdated); // Pass the payload with id
      } catch (error) {
        console.log('saveEvent: Error projecting radar to Supabase:', error);
      }
    }
    return radarUpdated;
  }