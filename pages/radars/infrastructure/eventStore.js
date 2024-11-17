// infrastructure/eventStore.js

const eventStore = [];

// Save events to the in-memory event store
export const saveEvent = async (event) => {
  // Check if an event with the same radar name already exists
  const existingEvent = eventStore.find(e => e.payload.name === event.payload.name);
  
  if (existingEvent) {
    throw new Error("Radar name must be unique");
  }

  // If no duplicate found, save the event
  eventStore.push(event);
};

// Get all stored events (useful for tests or debugging)
export const getEvents = async () => {
  return [...eventStore]; // Return a copy to prevent mutation
};

// Clear the event store (useful for tests)
export const clearEventStore = async () => {
  eventStore.length = 0;
};
