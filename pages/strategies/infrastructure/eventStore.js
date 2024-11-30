import { v4 as uuidv4 } from 'uuid'; // Import the UUID generator
//import { projectRadarToSupabase } from './radarProjection';
//import { publishIntegrationEvent } from '../../pubAndSub/pushAndSubEvents'

const eventStore = []; // In-memory event storage

export const saveStrategyToEventSource = async (event) => {
    try {
      const newTimestamp = new Date().getTime();
      let aggregateId;
      let previousAggregateId;
      let version;
  
      if (event.type === 'CREATE_STRATEGY') {
        console.log('Creating a new strategy...');
        aggregateId = uuidv4();
        previousAggregateId = null;
        version = 0;
      } else if (event.type === 'NEW_VERSION_OF_STRATEGY') {
        console.log('Creating a new version of an existing strategy...');
        aggregateId = uuidv4();
        previousAggregateId = event.payload.aggregate_id;
  
        // Retrieve the latest event for the given aggregate_id
        const latestEvent = await replay(previousAggregateId);
        version = latestEvent.payload.version + 1;
      } else {
        throw new Error('Invalid event type');
      }
  
      const eventWithId = {
        ...event,
        payload: {
          ...event.payload,
          aggregate_id: aggregateId,
          timestamp: newTimestamp,
          previous_version_of_strategy: previousAggregateId,
          version: version,
        },
      };
  
      eventStore.push(eventWithId);
      console.log('Event pushed:', eventWithId);
  
      return eventWithId;
    } catch (error) {
      console.error('Error saving strategy to event source:', error);
      throw error;
    }
  };

export const getStrategiesFromEventSource = async () => {
  // console.log("ES Fetching Events from Memory:", eventStore); // Log the fetch operation
  return [...eventStore]; // Return a copy to prevent mutation
};

export const clearStrategyEventSource = async () => {
  eventStore.length = 0; // Clear all events
 // console.log("ES Event store cleared."); // Log when the store is cleared
};

export const getNumberofEventsInEventSource = async () => {
    return eventStore.length;
}

export async function getStrategyByIdFromEventSource(aggregateId) {
  const events = await getStrategiesFromEventSource();
  const strategyEvents = events.filter(event => event.payload.aggregate_id === aggregateId);

  // Sort events by timestamp in descending order
  strategyEvents.sort((a, b) => b.payload.timestamp - a.payload.timestamp);

  // Return the latest event
  const latestEvent = strategyEvents[0];

  // Reconstruct the radar state from the latest event
  const strategy = latestEvent ? { ...latestEvent.payload } : {};

  return strategy;
}

export const replay = (aggregateId) => {
    const filteredEvents = eventStore.filter(event => event.payload.aggregate_id === aggregateId);
    filteredEvents.sort((a, b) => b.payload.timestamp - a.payload.timestamp);
    console.log("Aggregare rehydrated is", filteredEvents[0]);
    return filteredEvents[0];
  };
