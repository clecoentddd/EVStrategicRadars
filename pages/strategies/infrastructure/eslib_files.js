import fs from 'fs';
import path from 'path';

const eventsDirectory = path.join(process.cwd(), process.env.EVENTS_DIRECTORY || 'pages/strategies/_events');

console.log("Path I am using to store streams:", eventsDirectory);

// Create the events directory if it doesn't exist
if (!fs.existsSync(eventsDirectory)) {
  fs.mkdirSync(eventsDirectory);
}

// Helper function to read events from a file
export function readEventsFromFile(streamId) {
  console.log ("readEventsFromFile entering", eventsDirectory );
  const filePath = path.join(eventsDirectory, `${streamId}.json`);
  console.log("readEventsFromFile: Path", filePath);

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    console.log("readEventsFromFile: ", data);
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading events from file ${filePath}:`, error);
    return []; // Return an empty array if the file doesn't exist or fails to read
  }
}

// Helper function to write events to a file
export function writeEventsToFile(streamId, events) {
  const filePath = path.join(eventsDirectory, `${streamId}.json`);

  try {
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
    console.log("Events written successfully to:", filePath);
  } catch (error) {
    console.error(`Error writing events to file ${filePath}:`, error);
  }
}

// Get events for a specific stream
export function getEventsForStream(streamId) {
  return readEventsFromFile(streamId);
}

// Add an event to the file associated with a stream
export function appendEventToEventSourceDB(streamId, event) {
  const filePath = path.join(eventsDirectory, `${streamId}.json`);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    console.log(`File does not exist. Creating a new file: ${filePath}`);
    fs.writeFileSync(filePath, JSON.stringify([])); // Create the file with an empty array
  }

  const currentEvents = readEventsFromFile(streamId);
  currentEvents.push(event);
  writeEventsToFile(streamId, currentEvents);
}

// Clear all events in the event store
export function clearEventStore() {
  const allFiles = fs.readdirSync(eventsDirectory);
  for (const file of allFiles) {
    const filePath = path.join(eventsDirectory, file);
    fs.unlinkSync(filePath);
  }
  console.log("Event store cleared.");
}

// Get the total number of events in the event store
export function getNumberOfEvents() {
  const allFiles = fs.readdirSync(eventsDirectory);
  let totalEvents = 0;

  for (const file of allFiles) {
    const filePath = path.join(eventsDirectory, file);
    const events = readEventsFromFile(file.replace('.json', '')); // Remove the `.json` extension
    totalEvents += events.length;
  }
  return totalEvents;
}
