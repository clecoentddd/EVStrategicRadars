import { v4 as uuidv4 } from 'uuid';

// Simulating an in-memory event store
const eventStore = [];

// Handles event creation

export const sendItemCreated = async (eventPayload) => {
  const event = {
    type: 'StrategicItemCreated',
    aggregateId: uuidv4(), // Generate unique ID for the new item
    version: 1, // Starting version
    timeStamp: new Date().toISOString(),
    state: 'Created',
    ...eventPayload,
  };

  // Push the event to the store
  console.log('ES: Item Created Event:', event.state);
  eventStore.push(event);
  console.log('ES: Item Created Event:', event);
  return event;
};

// Handles event updates
export  const sendItemUpdated = async (eventPayload) => {
  const event = {
    type: 'StrategicItemUpdated',
    version: eventStore.length + 1, // Increment version for simplicity
    timeStamp: new Date().toISOString(),
    state: 'Updated',
    ...eventPayload,
  };

  // Push the event to the store
  eventStore.push(event);
  console.log('ES: Item Updated Event:', event);
  return event;
};

// Handles event deletions
export const sendItemDeleted = async (eventPayload) => {
  const event = {
    type: 'StrategicItemDeleted',
    version: eventStore.length + 1, // Increment version for simplicity
    timeStamp: new Date().toISOString(),
    state: 'Deleted',
    ...eventPayload,
  };

  // Push the event to the store
  eventStore.push(event);
  console.log('ES: Item Deleted Event:', event);
  return event;
};

// Replay function to build the current state of an aggregate
export const replayAggregate = async (aggregateId) => {
    // Initialize an empty state
    let aggregateState = {};
  
    // Iterate through the event store
    eventStore.forEach(event => {
      if (event.aggregateId === aggregateId) {
        // Apply the event to the aggregate state
        switch (event.type) {
          case 'StrategicItemCreated':
          case 'StrategicItemUpdated':
          case 'StrategicItemDeleted':
            aggregateState = { ...aggregateState, ...event };
            break;
          default:
            console.warn('Unknown event type:', event.type);
        }
      }
    });
  
    // Return the current state of the aggregate
    return aggregateState;
  };
    

export default {
  sendItemCreated,
  sendItemUpdated,
  sendItemDeleted,
  replayAggregate,
  eventStore, // Exporting the store for debugging
};
