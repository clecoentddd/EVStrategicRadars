import { v4 as uuidv4 } from 'uuid';
import { appendEventToFile, readEventsFromFile } from './eslib.js';
// import { replayStrategy } from './eventStoreStream';
import { projectElementToSupabase } from './ProjectionElements';

// Handles event creation
export const sendItemCreated = async (eventPayload) => {
  const event = {
    event: 'STRATEGIC_ELEMENT_CREATED',
    type: "STRATEGIC_ELEMENT",
    id: uuidv4(), // Generate unique ID for the new item
    stream_id: eventPayload.stream_id,
    strategy_id: eventPayload.strategy_id,
    version: 1, // Starting version
    timeStamp: new Date().toISOString(),
    state: 'Created',
    ...eventPayload,
  };

  appendEventToFile(event.stream_id, event);

  await projectElementToSupabase(event);

  console.log('ES: Item Created Event:', event);
  return event;
};

// Handles event updates
export const sendItemUpdated = async (eventPayload) => {
  const event = {
    event: 'STRATEGIC_ELEMENT_UPDATED',
    type: 'STRATEGIC_ELEMENT',
    id: eventPayload.id,
    stream_id: eventPayload.stream_id, // Include stream_id
    version: eventPayload.version || 2, // Increment version for simplicity
    timeStamp: new Date().toISOString(),
    state: 'Updated',
    ...eventPayload,
  };

  appendEventToFile(event.stream_id, event);

  // handle projection
  await projectElementToSupabase(event);

  console.log('ES: Item Updated Event:', event);
  return event;
};

// Handles event deletions
export const sendItemDeleted = async (element) => {
  console.log("sendItemDeleted: Element received to delete: ", element);

  // Fetch events from the stream
  const allEvents = readEventsFromFile(element.stream_id);

  console.log ("sendItemDeleted: see what comes out as all events", allEvents);

  // Check if the element exists
  const elementEvents = allEvents.filter(event => event.id === element.id);
  if (elementEvents.length === 0) {
    console.error(`ES: Could not find element in stream ${element.stream_id}`);
    throw new Error('Element not found in the stream');
  }

  const timeStamp = new Date().toISOString();
  const deletedElement = {
    event: 'STRATEGIC_ELEMENT_DELETED',
    type: 'STRATEGIC_ELEMENT',
    id: element.id,
    stream_id: element.stream_id,
    strategy_id: element.strategy_id,
    version: (elementEvents[elementEvents.length - 1]?.version || 1) + 1,
    timeStamp: timeStamp,
    state: 'Deleted',
  };

  console.log("sendItemDeleted: Element about to delete:", deletedElement);
  appendEventToFile(deletedElement.stream_id, deletedElement);

  // project update
  await projectElementToSupabase(deletedElement);

  const elementReplayed = await replayElement(deletedElement);
  console.log('ES: Item Deleted Event:', elementReplayed);
  return elementReplayed;
};

// Rebuild the aggregate state by applying each event in chronological order
export const replayElement = async (element) => {
  const allEvents = readEventsFromFile(element.stream_id);

  // Filter events for the specific element ID
  const elementEvents = allEvents.filter(event => event.id === element.id);

  if (elementEvents.length === 0) {
    console.log(`No events found for element ID: ${element.id}`);
    return { error: 'No events found for the specified element ID' };
  }

  // Sort events chronologically (important for correct state reconstruction)
  elementEvents.sort((a, b) => new Date(a.timeStamp) - new Date(b.timeStamp));

  // Rebuild the aggregate state by applying each event in chronological order
  const aggregateState = elementEvents.reduce((currentState, event) => {
    switch (event.event) {
      case 'STRATEGIC_ELEMENT_CREATED':
        return {
          id: event.id,
          stream_id: event.stream_id,
          strategy_id: event.strategy_id,
          type: event.type,
          version: event.version,
          timeStamp: event.timeStamp,
          state: event.state,
          name: event.name,
          description: event.description,
          // Include other properties as needed
        };

      case 'STRATEGIC_ELEMENT_UPDATED':
        return {
          ...currentState,
          ...event, // Overwrite with updated properties
          state: 'Updated',
          version: Math.max(currentState.version || 1, event.version),
          timeStamp: event.timeStamp,
          event: event.event
        };

      case 'STRATEGIC_ELEMENT_DELETED':
        return {
          ...currentState,
          state: 'Deleted',
          timeStamp: event.timeStamp,
          version: event.version,
          event: event.event,
          timeStamp: event.timeStamp,
        };

      default:
        console.warn('Unhandled event type:', event.type);
        return currentState;
    }
  }, {}); // Start with an empty initial state

  console.log('Replayed Element State:', aggregateState);
  return aggregateState;
};

export default {
  sendItemCreated,
  sendItemUpdated,
  sendItemDeleted,
  replayElement,
};
