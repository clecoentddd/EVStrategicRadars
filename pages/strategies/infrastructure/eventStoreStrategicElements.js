import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { replayStrategy } from './eventStoreStream';

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
function writeEventsToFile(event) {
  console.log ("wtiteEventstoFile: event received", event);
  try {
    const filePath = path.join(eventsDirectory, `${event.stream_id}.json`); 

    // Read existing events (if any)
    let existingEvents = [];
    try {
      existingEvents = readEventsFromFile(filePath);
    } catch (error) {
      // If the file doesn't exist, it's okay
    }

    // Append the new event
    existingEvents.push(event);

    // Write the updated array of events to the file
    fs.writeFileSync(filePath, JSON.stringify(existingEvents, null, 2)); 
  } catch (error) {
    console.error(`Error writing events to file ${filePath}:`, error);
  }
}

// Check events directory: it must exist
if (!fs.existsSync(eventsDirectory)) {
  throw new Error(`Events directory '${eventsDirectory}' does not exist.`);
}

// Handles event creation
export const sendItemCreated = async (eventPayload) => {
  const event = {
    type: 'STRATEGIC_ITEM_CREATED',
    id: uuidv4(), // Generate unique ID for the new item
    stream_id: eventPayload.stream_id, 
    strategy_id: eventPayload.strategy_id,
    version: 1, // Starting version
    timeStamp: new Date().toISOString(),
    state: 'Created',
    ...eventPayload,
  };

  writeEventsToFile(event); 

  console.log('ES: Item Created Event:', event);
  return event;
};

// Handles event updates
export const sendItemUpdated = async (eventPayload) => {
  const event = {
    type: 'STRATEGIC_ITEM_UPDATED',
    id: eventPayload.id,
    stream_id: eventPayload.stream_id, // Include stream_id
    version: 2, // Increment version for simplicity (you might want to calculate actual version)
    timeStamp: new Date().toISOString(),
    state: 'Updated',
    ...eventPayload,
  };

  writeEventsToFile(event); 
  console.log('ES: Item Updated Event:', event);
  return event;
};

// Handles event deletions
export const sendItemDeleted = async (eventPayload) => {
  console.log("sendItemDeleted: Element received to be delete: ", eventPayload);

  // check element exists
  const currentElement = replayElement(eventPayload);

  if (currentElement === null){
    console.error ("ES: Could not find element in stream", eventPayload.stream_id);
  }

  const timeStamp = new Date().toISOString();
  
  const deletedElement = {
    type: 'STRATEGIC_ITEM_DELETED',
    id: eventPayload.id,
    stream_id: eventPayload.stream_id, // Include stream_id
    strategy_id: eventPayload.strategy_id,
    version: eventPayload.version + 1, // Increment version for simplicity (you might want to calculate actual version)
    timeStamp: timeStamp,
    state: 'Deleted',
  };

  console.log ("sendItemDeleted : Element about to delete ", deletedElement);
  writeEventsToFile(deletedElement); 

  const element = replayElement(deletedElement);
  console.log('ES: Item Deleted Event:', element); 
  return element;
};

// Rebuild the aggregate state by applying each event in chronological order
  export const replayElement = async (element) => {
    const filePath = path.join(eventsDirectory, `${element.stream_id}.json`); 
    const filteredEvents = readEventsFromFile(filePath); 
  
    // Filter events for the specific element ID
    const elementEvents = filteredEvents.filter(event => event.id === element.id); 
  
    if (elementEvents.length === 0) {
      console.log(`No events found for element ID: ${element.id}`);
      return { error: 'No events found for the specified element ID' };
    }
  
    // Sort events chronologically (important for correct state reconstruction)
    elementEvents.sort((a, b) => new Date(a.timeStamp) - new Date(b.timeStamp)); 
  
    // Rebuild the aggregate state by applying each event in chronological order
    const aggregateState = elementEvents.reduce((currentState, event) => {
      switch (event.type) {
        case 'STRATEGIC_ITEM_CREATED':
          // Initialize the aggregate state
          return { 
            id: event.id, 
            stream_id: event.stream_id, 
            strategy_id: event.strategy_id, 
            version: event.version, 
            timeStamp: event.timeStamp, 
            state: event.state, 
            name: event.name, 
            description: event.description, 
            // Include other properties as needed
          };
  
        case 'STRATEGIC_ITEM_UPDATED':
          // Apply updates to the current state
          return {
            ...currentState, 
            ...event, // Overwrite with updated properties
            state: 'Updated', 
            version: Math.max(currentState.version || 1, event.version), 
            timeStamp: event.timeStamp, 
          };
  
        case 'STRATEGIC_ITEM_DELETED':
          // Mark the item as deleted and finalize the state
          return {
            ...currentState, 
            state: 'Deleted', 
            timeStamp: event.timestamp, 
            version: event.version, 
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