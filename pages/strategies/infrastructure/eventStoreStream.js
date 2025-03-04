import { projectStreamToSupabase } from "./ProjectionStreams.js";
import { v4 as uuidv4 } from 'uuid';
import { 
  appendEventToStrategyEventSourceDB, 
  getEventsForStream, 
} from './eslib.js';
import { LucideMoveLeft } from "lucide-react";

export const sendStreamCreated = async (event) => {
  
  console.log("ES Stream entering creation", event);
  
  try {
    const streamEvent = {
      eventType: "STREAM_CREATED",
      timestamp: new Date().toISOString(),
      aggregateType: "STREAM",
      aggregateId: uuidv4(),
        payload: {
          organisationId: event.organisationId,
          organisationName: event.organisationName,
          organisationLevel: event.organisationLevel,
          state: 'Draft',
          active_strategy_id: null,
      }
  };

    console.log("sendStreamCreated: appendEventToStrategyEventSourceDB", streamEvent);

    const result = await appendEventToStrategyEventSourceDB(streamEvent);

    // project the new stream
    console.log("sendStreamCreated: Ready to project stream to supabase", result);
  
    if (result) {
      try {
        await projectStreamToSupabase(...result);
        console.info('Projection to Supabase OK');
    } catch (error) {
      console.error('Error Projection:', error);
    }
  } else {
    console.warn('Seems the event was not stored correctly in EventSource. Skipping projection.');
  }

    return streamEvent;
  } catch (error) {
    console.error('sendStreamCreated: Error saving to event source:', error);
    throw error;
  }
};

export const sendStreamUpdated = async (event) => {
  console.log("ES Stream entering updating with event being", event);
  try {
    // Build the event object with the payload
    const eventToUpdate = {
      eventType: "STREAM_UPDATED", // Default event type
      aggregateId: event.aggregateId,
      timestamp: new Date().toISOString(),
      aggregateType: "STREAM",
      payload: {
        organisationId: event.payload.organisationId,
        organisationName: event.payload.organisationName,
        organisationLevel: event.payload.organisationLevel,
      },
    };

    if ('active_strategy_id' in event) {
      eventToUpdate.payload.active_strategy_id = event.payload.active_strategy_id;
      eventToUpdate.eventType = "STREAM_STRATEGY_UPDATED"; // Specific event type for strategy update
    }

    console.log("sendStreamUpdated: appendEventToStrategyEventSourceDB", eventToUpdate);

    await appendEventToStrategyEventSourceDB(eventToUpdate);

    // Project the updated stream
    await projectStreamToSupabase(eventToUpdate);

    return eventToUpdate;
  } catch (error) {
    console.error('sendStreamUpdated: Error saving to event source:', error);
    throw error;
  }
};

export const replayStream = async (streamId) => {
  try {
    console.log("Replay Stream: Starting replay for streamId:", streamId);

    // Fetch events for the specific stream
    const events = await getEventsForStream(streamId);
    console.log("Replay Stream: Fetched events from getEventsForStream:", events);

    // Rehydrate the aggregate by applying events in sequence
    const aggregate = events.reduce((currentAggregate, event) => {
      console.log("Replay Stream: Processing event with type:", event.eventType);
      console.log("Replay Stream: Current aggregate before processing event:", currentAggregate);
      console.log("Replay Stream: Event payload:", event.payload);

      switch (event.eventType) {
        case 'STREAM_CREATED':
          console.log("Replay Stream: Handling STREAM_CREATED event");
          // Initialize the aggregate with all fields from the event
          return {
            ...currentAggregate, // Retain any existing properties (if any)
            organisationId: event.payload.organisationId,
            organisationName: event.payload.organisationName,
            organisationLevel: event.payload.organisationLevel,
            state: event.payload.state || 'Draft', // Default state if not provided
            active_strategy_id: event.payload.active_strategy_id || null,
          };

        case 'STREAM_UPDATED':
          console.log("Replay Stream: Handling STREAM_UPDATED event");
          // Only update the name and timestamp
          return {
            ...currentAggregate, // Retain all existing properties
            organisationId: event.payload.organisationId,
            organisationName: event.payload.organisationName,
            organisationLevel: event.payload.organisationLevel,
          };

        case 'STREAM_STRATEGY_UPDATED':
          console.log("Replay Stream: Handling STREAM_STRATEGY_UPDATED event");
          // Only update the active_strategy_id and timestamp
          return {
            ...currentAggregate, // Retain all existing properties
            active_strategy_id: event.payload.active_strategy_id,
            timestamp: event.timestamp,
          };

        default:
          console.warn(`Replay Stream: Unhandled event type: ${event.eventType}`);
          return currentAggregate; // Return the aggregate unchanged
      }
    }, {}); // Start with an empty object as the initial aggregate

    console.log("Replay Stream: Final rehydrated aggregate:", aggregate);
    return {
      aggregateId: streamId,       // Include the stream ID in the response
      payload: aggregate  // The rehydrated aggregate
    };
  } catch (error) {
    console.error("Replay Stream: Error replaying stream:", error);
    throw error; // Re-throw the error to handle it upstream
  }
};
