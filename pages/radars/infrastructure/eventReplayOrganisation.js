import { getEventsForAnOrganisation } from './eslib';

export async function replayOrganisationAggregate(aggregateId) {
  try {
    console.log("Replay Organisation: ", aggregateId);
    // Get all events for the given aggregateId
    const events = await getEventsForAnOrganisation(aggregateId);

    // Filter events based on the conditions
   
    console.log("Organisation: events before replay", events);
    // const sortedFilteredEvents = events.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // Example using timestamp
    const sortedFilteredEvents = events.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      
      console.log('Comparing dates:', {
        'a.created_at': a.created_at,
        'dateA': dateA,
        'b.created_at': b.created_at,
        'dateB': dateB,
        'result': dateA - dateB
      });
    
      return dateA - dateB;
    });
    
    console.log('Final sorted array:', sortedFilteredEvents);
    
    // Replay events to reconstruct the radar state
    let radar = null; 
    for (const organisationEvent of sortedFilteredEvents) {
      console.log("Organisation - Event being replayed", organisationEvent);
      switch (organisationEvent.eventType) {
        case 'RADAR_CREATED':
          radar = {
            aggregateId: aggregateId,
            name: organisationEvent.payload.name,
            purpose: organisationEvent.payload.purpose,
            level: organisationEvent.payload.level,
          };
          break;
        case 'RADAR_UPDATED':
          if (radar) { 
            radar = {
              ...radar, 
              name: organisationEvent.payload.name, 
              purpose: organisationEvent.payload.purpose, 
              context: organisationEvent.payload.context,
              level: organisationEvent.payload.level,
            };
          } else {
            throw new Error(`Invalid event sequence: RADAR_UPDATED encountered before RADAR_CREATED for aggregate ${aggregateId}`);
          }
          break;
        case 'RADAR_DELETED':
          radar = null; 
          break;
        default:
          throw new Error(`Unknown event type: ${organisationEvent}`);
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