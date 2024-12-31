import { v4 as uuidv4 } from "uuid"; // UUID generator for creating radar item id
import { projectRadarItemToSupabase } from './radarItemsProjection'; // Import projection function
import {appendEventToFile, readEventsFromFile} from './eslib';

const radarItemEvents = []; // In-memory storage for radar item events

// Save Radar Item Event (with event name)
export const saveRadarItemEvent = async (event) => {
  try {
    // Generate a unique id (if not provided)
    console.log("EVENTSTORE event is ", event);
    if (event.event === "RADAR_ITEM_CREATED") {
    event.payload.id = uuidv4();
  };
    
    
  console.log("EVENTSTORE event is ", event.payload.id);
    // Add timestamp
    event.payload.timestamp = new Date().getTime();

    console.log("Current Radar Item Events in Memory - Timestamp:", event.timestamp);

    // Save the event in memory
    // radarItemEvents.push(event);
    const eventReturned = appendEventToFile(event.payload.radarId, event);

    console.log("Radar Item Event saved:", eventReturned);
    console.log("Current Radar Item Events in Memory:", radarItemEvents);

    // Project the radar item to Supabase - don't wait
    const projectionResult = projectRadarItemToSupabase(event.payload); // Pass the payload to the projection function
    
    const aggregate = {
      ...event.payload, // Use the payload of the latest event to construct the state
    };

    console.log ("ES: Aggregate created or saved is" , aggregate)
    return { success: true, ...aggregate };
    

  } catch (error) {
    console.error("Error saving radar item event:", error.message);
    return { success: false, message: "Error saving radar item event" };
  }
};

// Fetch all Radar Item Events (for a given radarId)
export const getRadarItemEvents = async (radarId, id) => {
  console.log("ES: get all events for id", id);

  const events = readEventsFromFile(radarId);

  console.log("getRadarItemEvents events are", events);

  //const filteredEvents = events.filter(
  //  (event) => event.type === 'RADAR_ITEM' && event.payload.id === id
  //);
  const filteredEvents = events.filter((event) => {
    // Log each event being checked
    console.log("Checking event:", event);
  
    // Log whether the event matches the type condition
    const isRadarItem = event.payload.aggregate_type === 'RADAR_ITEM';
    console.log(`Event type === 'RADAR_ITEM':`, isRadarItem);
  
    // Log whether the event matches the payload ID condition
    const isMatchingId = event.payload?.id === id; // Add optional chaining to prevent errors
    console.log(`Event payload.id === id (${id}):`, isMatchingId);
  
    // Log the final result of the filter condition for the event
    const shouldInclude = isRadarItem && isMatchingId;
    console.log(`Should include event:`, shouldInclude);
  
    return shouldInclude;
  });
  
  // Log the filtered events for further inspection
  console.log("Filtered events:", filteredEvents);
  
  console.log("Fetching Radar Item Events for radarId:", radarId);
  console.log("Filtered Events:", filteredEvents);

  return filteredEvents;
};


// Clear all Radar Item Events (for testing purposes or resetting the event store)
export const clearRadarItemEventStore = async () => {
  radarItemEvents.length = 0;
  console.log("Radar Item Event Store Cleared.");
};

// Replay events to get the last state of the radar item based on the most recent event
export const replayRadarItemState = async (radarId, id) => {
  try {
    // Fetch events for the given id
    const events = await getRadarItemEvents(radarId, id);

    if (!events || events.length === 0) {
      return { success: false, message: `No events found for id: ${id}` };
    }

    console.log("ES: Events to replay", events);

    // Identify the latest event based on timestamp or sequence
   // const latestEvent = events.reduce((latest, current) => {
      // Assuming 'timestamp' is the property representing the event time
    //  return current.timestamp > latest.timestamp ? current : latest;
    // }, events[0]); // Initial value is the first event

    const latestEvent = events.reduce((latest, current) => {
      console.log('Current event:', current);
      console.log('Latest event so far:', latest);
      console.log('Comparing timestamps:', current.payload.timestamp, '>', latest.payload.timestamp);
    
      return current.payload.timestamp > latest.payload.timestamp ? current : latest;
    }, events[0]);
    
    console.log('Final latest event:', latestEvent);
    
 
    console.log("Latest Event for Hydration:", latestEvent);

    // Hydrate the aggregate using the latest event's payload
    const hydratedAggregate = {
      ...latestEvent.payload, // Use the payload of the latest event to construct the state
      id,           // Ensure the id is part of the state
    };

    console.log("Hydrated Radar Item Aggregate:", hydratedAggregate);

    return { success: true, ...hydratedAggregate };
  } catch (error) {
    console.error("Error replaying radar item state:", error.message);
    return { success: false, message: "Error replaying radar item state" };
  }
};
