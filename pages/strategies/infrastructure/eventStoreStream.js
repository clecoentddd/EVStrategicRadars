import { v4 as uuidv4 } from 'uuid';

const eventStore = [];

function getLatestStrategy(streamId) {
  const streamEvents = getEventsForStream(streamId);
  const strategyEvents = streamEvents.filter(event => event.type === 'STRATEGY_NEW_VERSION_CREATED');

  strategyEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (strategyEvents.length > 0) {
    return strategyEvents[0];
  } else {
    return null;
  }
}

export function getEventsForStream(streamId) {
  const filteredEvents = eventStore.filter(event => event.stream_id === streamId);
  return filteredEvents;
}

export const sendNewStreamCreated = async (event) => {
  try {
    const timeStamp = new Date().toISOString();
    if (event.type === 'STRATEGY_STREAM_CREATED') {
      const streamId = uuidv4();
      const streamEvent = {
        type: event.type,
        stream_id: streamId,
        radar_id: event.radar_id,
        name: event.name,
        timestamp: timeStamp,
        state: 'Open',
      };

      
      // console.log("Current state of eventStore - Before:", eventStore);
      eventStore.push(streamEvent);
      // console.log("Current state of eventStore - After:", eventStore);
      return streamEvent;
    } else {
      throw new Error('Invalid event type');
    }
  } catch (error) {
    console.error('Error saving to event source:', error);
    throw error;
  }
}

export const sendNewStrategyCreated = async (event) => {
  try {
    // Retrieve the latest strategy based on the stream_id
    const previousStrategy = getLatestStrategy(event.stream_id);
    
    // Calculate the new version
    const previousVersion = previousStrategy?.version || 0; // Default to 0 if no previous version
    const newVersion = previousStrategy ? previousVersion + 1 : 1;
    
    // Preparing to close the previous strategy if it exists
    if (newVersion > 1) {
      const closeStrategy = {
        type: 'STRATEGY_CLOSED',
        stream_id: previousStrategy.stream_id,
        aggregate_id: previousStrategy.aggregate_id,
        timestamp: new Date().toISOString(),
        state: 'Closed',
      };

      eventStore.push(closeStrategy);
      console.log("Closing version: Current state of eventStore - After:", eventStore);
    }
    
    // Opening the new strategy
    const newStrategy = {
      type: event.type,
      stream_id: event.stream_id,
      aggregate_id: uuidv4(), // Generate a unique ID for the new aggregate
      previousAggregate_id: previousStrategy?.aggregate_id || null, // Null if no previous aggregate
      version: newVersion, // Increment or initialize the version
      timestamp: new Date().toISOString(), // Ensure timestamp is properly set
      state: 'Open',
      name: event.name,
      description: event.description,
    };

    
    // console.log("Test1 Current state of eventStore - Before:", newStrategy);
    eventStore.push(newStrategy);
    console.log("Opening New Strategy - Current state of eventStore - After:", eventStore);
    return newStrategy;

  } catch (error) {
    console.error('Error saving to event source:', error);
    throw error;
  }
};

export const getStrategiesFromEventSource = async () => {
  console.log("ES Fetching Events from Memory:", eventStore); // Log the fetch operation
  return [...eventStore]; // Return a copy to prevent mutation
};

export const clearStrategyEventSource = async () => {
  eventStore.length = 0; // Clear all events
  console.log("ES Event store cleared."); // Log when the store is cleared
};

export const getNumberofEventsInEventSource = async () => {
  return eventStore.length;
}

export async function getStrategyByIdFromEventSource(aggregateId) {
  const events = await getStrategiesFromEventSource();
  const strategyEvents = events.filter(event => event.aggregate_id === aggregateId);

  // Sort events by timestamp in descending order
  strategyEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Return the latest event
  const latestEvent = strategyEvents[0];

  // Reconstruct the radar state from the latest event
  const strategy = latestEvent ? { ...latestEvent } : {};

  return strategy;
}

export const replay = (aggregateId) => {
  const filteredEvents = eventStore.filter(event => event.aggregate_id === aggregateId);
  filteredEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  console.log("Aggregate rehydrated is", filteredEvents[0]);
  return filteredEvents[0];
};