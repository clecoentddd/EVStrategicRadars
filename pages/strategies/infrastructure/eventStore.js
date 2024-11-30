import { v4 as uuidv4 } from 'uuid';

const eventStore = [];


function getLatestStrategy(streamId) {

    const streamEvents = getEventsForStream(streamId);
    console.log("All events for stream:", streamId, streamEvents);
  
    const strategyEvents = streamEvents.filter(event => event.type === 'STRATEGY_NEW_VERSION_CREATED');
    console.log("Filtered strategy events:", strategyEvents);
  
    strategyEvents.sort((a, b) => b.timestamp - a.timestamp);
    console.log("Sorted strategy events:", strategyEvents);
  
    if (strategyEvents.length > 0) {
      console.log("Latest strategy:", strategyEvents[0]);
      return strategyEvents[0];
    } else {
      return null;
    }
  };

export function getEventsForStream(streamId) {
    console.log("Getting events for stream ID:", streamId);
    const filteredEvents = eventStore.filter(event => event.stream_id === streamId);
    console.log("Filtered events:", filteredEvents);
    return filteredEvents;
  };

export const saveToEventSource = async (event) => {
  
    try {
    const timeStamp = new Date().toISOString();
    if (event.type === 'STRATEGY_STREAM_CREATED') {
      const streamId = uuidv4();
     
      const streamEvent = {
        type : event.type,
        stream_id: streamId,
        radar_id: event.radar_id,
        name: event.name,
        timestamp: timeStamp,
        status: 'Open',
      };
    
      eventStore.push(streamEvent);
      console.log('New strategy stream version created:', streamEvent);
      return streamEvent;

    } else if (event.type === 'STRATEGY_NEW_VERSION_CREATED') {
        // Retrieve the latest strategy based on the stream_id
        const previousStrategy = getLatestStrategy(event.stream_id);
        
        console.log("Return previous strategy", previousStrategy?.aggregateId || null);
      
        // Calculate the new version
        const previousVersion = previousStrategy?.version || 0; // Default to 0 if no previous version
        const newVersion = previousStrategy ? previousVersion + 1 : 0;
      
        // preparing to close the book
        ' Close the book'
        console.log ("Before closing the book", newVersion);
        if ( newVersion > 0 ) {
            previousStrategy.status = 'Close';
            previousStrategy.type = 'STRATEGY_CLOSED';
            previousStrategy.timeStamp = new Date().toISOString();
        }

        ' Opening the new book'
        const newStrategy = {
          type: event.type,
          stream_id: event.stream_id,
          aggregateId: uuidv4(), // Generate a unique ID for the new aggregate
          previousAggregateId: previousStrategy?.aggregateId || null, // Null if no previous aggregate
          version: newVersion, // Increment or initialize the version
          timeStamp: new Date().toISOString(), // Ensure timestamp is properly set
          status: 'Open',
        };

    console.log("New strategy event created:", newStrategy);

    // Close the previous strategy if it exists.
    if (newVersion > 0) {
      eventStore.push(previousStrategy);
      console.log ("Closing the book for", previousStrategy);
    };

    ' Open the book'
      eventStore.push(newStrategy);
      console.log('New strategy version created:', newStrategy);
      return newStrategy;

    } else {
      throw new Error('Invalid event type');
    }
  } catch (error) {
    console.error('Error saving to event source:', error);
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