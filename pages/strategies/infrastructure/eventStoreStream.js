import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
// import { eventsDirectory } from './config'; 
export const eventsDirectory = './events'; 

// Helper function to read events from a file
function readEventsFromFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading events from file ${filePath}:`, error);
    return [];
  }
}

// Helper function to write events to a file
function writeEventsToFile(filePath, events) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
  } catch (error) {
    console.error(`Error writing events to file ${filePath}:`, error);
  }
}

// Create the events directory if it doesn't exist
if (!fs.existsSync(eventsDirectory)) {
  fs.mkdirSync(eventsDirectory);
}

function getEventsForStream(streamId) {
  const filePath = path.join(eventsDirectory, `${streamId}.json`);
  return readEventsFromFile(filePath);
}

export const sendStreamCreated = async (event) => {
    console.log ("ES Stream entering creation");
       try {
        const streamEvent = {
            type: "NEW_STREAM_CREATED",
            id: uuidv4(),
            radar_id: event.radar_id,
            name: event.name,
            timestamp: new Date().toISOString(),
            state: 'Open',
            active_strategy_id: null,
        };

        const filePath = path.join(eventsDirectory, `${streamEvent.id}.json`);
        console.log("ES - file path for stream", filePath);
        writeEventsToFile(filePath, [streamEvent]);

        return streamEvent;
    } catch (error) {
        console.error('Error saving to event source:', error);
        throw error;
    }
};

export const sendStrategyCreated = async (event) => {
 console.log("ES - sendStrategyCreated entering...");
  try {
    // Retrieve the latest strategy based on the stream_id
    console.log ("sendStrategyCreated - event received:", event);
    
    const currentStream = replayStream(event.stream_id);
    
    console.log ("Stream is:", currentStream);

    let new_strategy_id ;
    let new_version ;
    let previous_strategy_id;

    new_version = 1;
    previous_strategy_id = null;
    console.log("ES stream ID ", currentStream.active_strategy_id);
    if (currentStream.active_strategy_id != null) {
        const currentStrategy = await replayStrategy(currentStream.active_strategy_id);
        new_version = currentStrategy.version + 1;
        previous_strategy_id = currentStrategy.id;
    }
    
    // Preparing to close the previous strategy if it exists
    if (new_version > 1) {
      const closeStrategy = {
        type: 'STRATEGY_CLOSED',
        id: previous_strategy_id,
        timestamp: new Date().toISOString(),
        state: 'Closed',
      };

      const filePath = path.join(eventsDirectory, `${event.stream_id}.json`);
      const streamEvents = readEventsFromFile(filePath);
      streamEvents.push(closeStrategy);
      writeEventsToFile(filePath, streamEvents);
      console.log("Closing version: Current state of eventStore - After:", closeStrategy); 
    }
    
    // Opening the new strategy
    const new_uuid = uuidv4();
    const newStrategy = {
      type: "NEW_STRATEGY_CREATED",
      stream_id: event.stream_id,
      id: new_uuid, 
      previousAggregate_id: previous_strategy_id, 
      version: new_version, 
      timestamp: new Date().toISOString(), 
      state: 'Open',
      name: event.name,
      description: event.description,
    };

    const newActiveVersionInStream = {
      type: "STREAM_WITH_LATEST_STRATEGY_VERSION_UPDATED",
      id: event.stream_id,
      active_strategy_id: newStrategy.id,
    };

    const filePath = path.join(eventsDirectory, `${event.stream_id}.json`);
    const streamEvents = readEventsFromFile(filePath);
    streamEvents.push(newStrategy);
    streamEvents.push(newActiveVersionInStream);
    writeEventsToFile(filePath, streamEvents);

    return newStrategy;

  } catch (error) {
    console.error('Error saving to event source:', error);
    throw error;
  }
};

export const getStrategiesFromEventSource = async () => {
  const allFiles = fs.readdirSync(eventsDirectory);
  const allEvents = [];

  for (const file of allFiles) {
    const filePath = path.join(eventsDirectory, file);
    const streamEvents = readEventsFromFile(filePath);
    allEvents.push(...streamEvents);
  }

  return allEvents;
};

export const clearStrategyEventSource = async () => {
  const allFiles = fs.readdirSync(eventsDirectory);
  for (const file of allFiles) {
    const filePath = path.join(eventsDirectory, file);
    fs.unlinkSync(filePath);
  }
  console.log("ES Event store cleared.");
};

export const getNumberofEventsInEventSource = async () => {
  const allFiles = fs.readdirSync(eventsDirectory);
  let totalEvents = 0;
  for (const file of allFiles) {
    const filePath = path.join(eventsDirectory, file);
    const streamEvents = readEventsFromFile(filePath);
    totalEvents += streamEvents.length;
  }
  return totalEvents;
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
  const filePath = path.join(eventsDirectory, `${streamId}.json`);
  const filteredEvents = readEventsFromFile(filePath);
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
          active_strategy_id: event.active_strategy_id || null,
        };

      case 'STREAM_WITH_LATEST_STRATEGY_VERSION_UPDATED':
        return {
          ...currentAggregate,
          active_strategy_id: event.active_strategy_id,
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

export const replayStrategy = async (strategyId) => {
    // Filter events for the given strategy ID
    const allEvents = await getStrategiesFromEventSource();
    const filteredEvents = allEvents.filter(event => event.id === strategyId); 
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
  
        case 'STRATEGY_CLOSED':
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