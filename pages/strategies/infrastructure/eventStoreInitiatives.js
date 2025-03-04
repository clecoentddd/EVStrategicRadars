import { v4 as uuidv4 } from 'uuid';
import { appendEventToStrategyEventSourceDB, readEventsFromEventSourceDB } from './eslib.js';
// import { replayStrategy } from './eventStoreStream';
import { projectElementToSupabase } from './ProjectionInitiatives.js';

// Handles event creation
export const sendInitativeCreated = async (eventPayload) => {
  const event = {
    aggregateType: "INITIATIVE",
    aggregateId: uuidv4(), // Generate unique ID for the new item
    eventType: 'INITIATIVE_CREATED',
    timestamp: new Date().toISOString(),
    payload: {
      stream_id: eventPayload.stream_id,
      strategy_id: eventPayload.strategy_id,
      version: 1, // Starting version
      state: 'Created',
      ...eventPayload,
    }
  };

  await appendEventToStrategyEventSourceDB(event);

  await projectElementToSupabase(event);

  console.log('ES: Item Created Event:', event);
  return event;
};

// Handles event updates
export const sendInitativeUpdated = async (eventPayload) => {
  console.log("Initiative to update is", eventPayload);
  const event = {
    eventType: 'INITIATIVE_UPDATED',
    aggregateType: "INITIATIVE",
    aggregateId: eventPayload.initiativeId,
    timeStamp: new Date().toISOString(),
    payload : {
      version: eventPayload.version || 2, // Increment version for simplicity
     state: 'Updated',
      ...eventPayload,
    }
  };

  await appendEventToStrategyEventSourceDB(event);

  // handle projection
  await projectElementToSupabase(event);

  console.log('ES: Item Updated Event:', event);
  return event;
};

// Handles event deletions
export const sendInitativeDeleted = async (initative) => {
  console.log("sendInitativeDeleted: Element received to delete: ", initative);

  // Fetch events from the stream
  const allEvents = await readEventsFromEventSourceDB(initative.payload.stream_id);

  console.log ("sendInitativeDeleted: see what comes out as all events", allEvents);

  // Check if the element exists
  const elementEvents = allEvents.filter(event => event.id === initative.aggregateId);
  if (elementEvents.length === 0) {
    console.error(`ES: Could not find element in stream ${initative.payload.stream_id}`);
    throw new Error('Element not found in the stream');
  }

  const timeStamp = new Date().toISOString();
  const deletedElement = {
    eventType: 'INITIATIVE_DELETED',
    aggregateType: 'INITATIVE',
    aggregateId: initiative.aggregateId,
    timeStamp: new Date().toISOString(),
    payload : {
     version: (elementEvents[elementEvents.length - 1]?.version || 1) + 1,
     state: 'Deleted',
    }
  };

  console.log("sendInitativeDeleted: Element about to delete:", deletedElement);
  appendEventToStrategyEventSourceDB(deletedElement.stream_id, deletedElement);

  // project update
  await projectElementToSupabase(deletedElement);

  const elementReplayed = await replayInitative(deletedElement);
  console.log('ES: Item Deleted Event:', elementReplayed);
  return elementReplayed;
};

// Rebuild the aggregate state by applying each event in chronological order
export const replayInitative = async (element) => {
  try {
    console.log("replayInitative: Starting replay for initiative ID:", element.id);

    // Fetch all events for the stream
    const allEvents = await readEventsFromFile(element.stream_id);
    console.log("replayInitative: Fetched events from readEventsFromFile:", allEvents);

    // Filter events for the specific element ID
    const elementEvents = allEvents.filter(event => event.aggregateId === element.id);
    console.log("Replay Element: Filtered events for element ID:", elementEvents);

    if (elementEvents.length === 0) {
      console.log(`Replay Initiative: No events found for element ID: ${element.id}`);
      return { error: 'No events found for the specified element ID' };
    }

    // Sort events chronologically (important for correct state reconstruction)
    elementEvents.sort((a, b) => new Date(a.timeStamp) - new Date(b.timeStamp));
    console.log("Replay Element: Sorted events:", elementEvents);

    // Rebuild the aggregate state by applying each event in chronological order
    const aggregateState = elementEvents.reduce((currentState, event) => {
      console.log("Replay Element: Processing event with type:", event.eventType);
      console.log("Replay Element: Current state before processing event:", currentState);
      console.log("Replay Element: Event payload:", event.payload);

      switch (event.eventType) {
        case 'INITIATIVE_CREATED':
          console.log("Replay Element: Handling INITIATIVE_CREATED event");
          return {
            id: event.aggregateId,
            stream_id: event.payload.stream_id,
            strategy_id: event.payload.strategy_id,
            version: event.payload.version || 1,
            state: event.payload.state || 'Created',
            name: event.payload.name,
            description: event.payload.description,
            timeStamp: event.timeStamp,
          };

        case 'INITIATIVE_UPDATED':
          console.log("Replay Element: Handling INITIATIVE_UPDATED event");
          return {
            ...currentState,
            ...event.payload, // Overwrite with updated properties
            state: 'Updated',
            version: Math.max(currentState.version || 1, event.payload.version || 1),
            timeStamp: event.timeStamp,
          };

        case 'INITIATIVE_DELETED':
          console.log("Replay Element: Handling INITIATIVE_DELETED event");
          return {
            ...currentState,
            state: 'Deleted',
            timeStamp: event.timeStamp,
            version: event.payload.version || (currentState.version || 1) + 1,
          };

        default:
          console.warn("Replay Element: Unhandled event type:", event.eventType);
          return currentState;
      }
    }, {}); // Start with an empty initial state

    console.log("Replay Element: Final rehydrated aggregate state:", aggregateState);
    return aggregateState;
  } catch (error) {
    console.error("Replay Element: Error replaying element:", error);
    throw error; // Re-throw the error to handle it upstream
  }
};

export default {
  sendInitativeCreated,
  sendInitativeUpdated,
  sendInitativeDeleted,
  replayInitative,
};
