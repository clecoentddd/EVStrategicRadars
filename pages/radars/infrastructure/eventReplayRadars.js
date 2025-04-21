import { getEventsForAnOrganisation } from './eslib';

export async function replayRadarAggregate(aggregateId) {
  try {
    console.log("Replay Radar: ", aggregateId);
    // Get all events for the given aggregateId
    const events = await getEventsForAnOrganisation(aggregateId);

    // Filter events based on the conditions
   
    console.log("Events before replay", events);
    const sortedFilteredEvents = events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Example using timestamp

    
    // Replay events to reconstruct the radar state
    let radar = null; 
    for (const radarEvent of sortedFilteredEvents) {
      console.log("Event being replayed", radarEvent);
      switch (radarEvent.eventType) {
        case 'RADAR_CREATED':
          radar = {
            radarId: aggregateId,
            name: radarEvent.payload.name,
            purpose: radarEvent.payload.purpose,
            level: radarEvent.payload.level,
          };
          break;
        case 'RADAR_UPDATED':
          if (radar) { 
            radar = {
              ...radar, 
              name: radarEvent.payload.name, 
              purpose: radarEvent.payload.purpose, 
              context: radarEvent.payload.context,
              level: radarEvent.payload.level,
            };
          } else {
            throw new Error(`Invalid event sequence: RADAR_UPDATED encountered before RADAR_CREATED for aggregate ${aggregateId}`);
          }
          break;
        case 'RADAR_DELETED':
          radar = null; 
          break;
        default:
          throw new Error(`Unknown event type: ${radarEvent}`);
      }
    }

    if (radar === null) {
      return 'Aggregate deleted'; 
    }

    return radar;
  } catch (error) {
    console.error(`Error replaying radar aggregate ${aggregateId}:`, error);
    throw error; // Re-throw the error
  }
}