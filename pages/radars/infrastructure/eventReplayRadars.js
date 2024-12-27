import { readEventsFromFile } from './eslib';

export async function replayRadarAggregate(aggregateId) {
  try {
    // Get all events for the given aggregateId
    const events = await readEventsFromFile(aggregateId);

    // Replay events to reconstruct the radar state
    let radar = null; 
    for (const event of events) {
      console.log("Event being replayed", event.eventType);
      switch (event.eventType) {
        case 'RADAR_CREATED':
          radar = {
            id: event.payload.id,
            name: event.payload.name,
            description: event.payload.description,
            level: event.payload.level,
          };
          break;
        case 'RADAR_UPDATED':
          if (radar) { 
            radar = {
              ...radar, 
              name: event.payload.name, 
              description: event.payload.description, 
              level: event.payload.level,
            };
          } else {
            throw new Error(`Invalid event sequence: RADAR_UPDATED encountered before RADAR_CREATED for aggregate ${aggregateId}`);
          }
          break;
        case 'RADAR_DELETED':
          radar = null; 
          break;
        default:
          throw new Error(`Unknown event type: ${event.type}`);
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