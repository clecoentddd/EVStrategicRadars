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
    if (event.radar_id != null) {
      const streamId = uuidv4();
      const streamEvent = {
        type: "NEW_STREAM_CREATED",
        id: streamId,
        radar_id: event.radar_id,
        name: event.name,
        timestamp: timeStamp,
        state: 'Open',
        active_version: null,
      };

      
      // console.log("Current state of eventStore - Before:", eventStore);
      eventStore.push(streamEvent);
      // console.log("Current state of eventStore - After:", eventStore);
      console.log("EvenStoreStream: Create a stream -> dump EventStore after event pushed :", eventStore);
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
    console.log ("sendNewStrategyCreated - event received:", event);
    const currentStream = replayStream(event.stream_id);
    
    console.log ("Stream is:", currentStream);

    const currentStrategy = replayStrategy(currentStream.active_version);

    console.log("Create a new strategy -> dump EventStore (before) ", eventStore);

    // Calculate the new version
    const previousVersion = currentStrategy?.version || 0; // Default to 0 if no previous version
    const newVersion = currentStrategy ? previousVersion + 1 : 1;
    const previousVersionId = currentStrategy?.id || 0 ;

    // console.log ("EventStoreStream -> check id of previous version :", previousVersionId);
   
    // Preparing to close the previous strategy if it exists
    if (newVersion > 1) {
      const closeStrategy = {
        type: 'STRATEGY_CLOSED',
        id: currentStrategy.id,
        timestamp: new Date().toISOString(),
        state: 'Closed',
      };
      eventStore.push(closeStrategy);
      console.log("Create a stream -> dump EventStore after ", eventStore);
    }
    
    // Opening the new strategy
    const new_uuid = uuidv4();
  
    const newStrategy = {
      type: "NEW_STRATEGY_CREATED",
      stream_id: event.stream_id,
      id: new_uuid, // Generate a unique ID for the new aggregate
      previousAggregate_id: previousVersionId, // Null if no previous aggregate
      version: newVersion, // Increment or initialize the version
      timestamp: new Date().toISOString(), // Ensure timestamp is properly set
      state: 'Open',
      name: event.name,
      description: event.description,
    };

    const newActiveVersionInStream = {
      type: "STREAM_WITH_LATEST_STRATEGY_VERSION_UPDATED",
      id: event.stream_id,
      active_version: newStrategy.id,
    } 
    // console.log("Test1 Current state of eventStore - Before:", newStrategy);
    eventStore.push(newStrategy);
    eventStore.push(newActiveVersionInStream);
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

export const replayStream = (streamId) => {
  // Filter events for the given stream ID
  console.log("Replay Stream id - stream id ", streamId);
  console.log("Replay Stream id - dump EventStore ", eventStore);
  const filteredEvents = eventStore.filter(event => event.id === streamId);
  console.log("Replay Stream with events:", filteredEvents);

  // Apply each event to an initial state object to rehydrate the aggregate
  const aggregate = filteredEvents.reduce((currentAggregate, event) => {
    switch (event.type) {
      case 'NEW_STREAM_CREATED':
        return {
          ...currentAggregate,
          id: event.id,
          radar_id: event.radar_id,
          name: event.name,
          timestamp: event.timestamp,
          state: event.state,
          active_version: event.active_version || null,
        };

      case 'STREAM_WITH_LATEST_STRATEGY_VERSION_UPDATED':
        return {
          ...currentAggregate,
          active_version: event.active_version,
        };

      // Add more cases as needed to handle additional event types

      default:
        console.warn(`Unhandled event type: ${event.type}`);
        return currentAggregate;
    }
  }, {}); // Start with an empty aggregate

  console.log("Replay Stream - Rehydrated aggregate:", aggregate);
  return aggregate;
};



export const replayStrategy = (strategyId) => {
  // Filter events for the given strategy ID
  console.log("Replay Strategy for id:", strategyId);

  const filteredEvents = eventStore.filter(event => event.id === strategyId);
  
  console.log("Replay Strategy with events:", filteredEvents);

  // Apply each event to an initial state object to rehydrate the strategy aggregate
  const aggregate = filteredEvents.reduce((currentAggregate, event) => {
    switch (event.type) {
      case 'NEW_STRATEGY_CREATED':
        return {
          ...currentAggregate,
          id: event.id,
          stream_id: event.stream_id,
          previousAggregate_id: event.previousAggregate_id,
          version: event.version,
          timestamp: event.timestamp,
          state: event.state,
          name: event.name,
          description: event.description,
        };

      case 'STRATEGY_CLOSE':
        return {
          ...currentAggregate,
          state: event.state || currentAggregate.name,
          timestamp: event.timestamp, // Use the latest timestamp
        };

      case 'STRATEGY_STATE_CHANGED':
        return {
          ...currentAggregate,
          state: event.state,
          timestamp: event.timestamp, // Use the latest timestamp
        };

      // Add more cases as needed to handle additional event types

      default:
        console.warn(`Unhandled event type: ${event.type}`);
        return currentAggregate;
    }
  }, {}); // Start with an empty aggregate

  console.log("Replay Strategy - Rehydrated aggregate:", aggregate);
  return aggregate;
};
