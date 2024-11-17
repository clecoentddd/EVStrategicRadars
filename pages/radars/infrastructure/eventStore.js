// pages/radars/infrastructure/eventStore.js

const eventStore = []; // In-memory event storage

export const saveEvent = async (event) => {
  eventStore.push(event); // Push the new event into the event store

  // Log the event being saved and the current state of the event store
  console.log("ES Event saved:", event);
  console.log("ES Current Events in Memory after saving:", eventStore); // Log all stored events after saving
};

export const getEvents = async () => {
  console.log("ES Fetching Events from Memory:", eventStore); // Log the fetch operation
  return [...eventStore]; // Return a copy to prevent mutation
};

export const clearEventStore = async () => {
  eventStore.length = 0; // Clear all events
  console.log("ES Event store cleared."); // Log when the store is cleared
};
