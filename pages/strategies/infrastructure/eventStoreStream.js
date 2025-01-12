import { projectStreamToSupabase } from "./ProjectionStreams";
import { v4 as uuidv4 } from 'uuid';
import { 
  appendEventToFile, 
  getEventsForStream, 
} from './eslib.js';

export const sendStreamCreated = async (event) => {
  console.log("ES Stream entering creation");
  try {
    const streamEvent = {
      event: "STREAM_CREATED",
      type: "STREAM",
      id: uuidv4(),
      radarId: event.radarId,
      name: event.name,
      timestamp: new Date().toISOString(),
      state: 'Open',
      active_strategy_id: null,
    };

    console.log("sendStreamCreated: appendEventToFile", streamEvent);

    appendEventToFile(streamEvent.id, streamEvent);

    // project the new stream
    await projectStreamToSupabase(streamEvent);

    return streamEvent;
  } catch (error) {
    console.error('sendStreamCreated: Error saving to event source:', error);
    throw error;
  }
};

export const sendStreamUpdated = async (event) => {
  console.log("ES Stream entering updating");
  try {
        // Build the object with only the fields to update
        const eventToUpdate = {};

        // Ready to save the stream of id event.id
        eventToUpdate.id = event.id;

        // Safely check and update fields
        if ('name' in event) {
          eventToUpdate.name = event.name;
          eventToUpdate.event = "STREAM_UPDATED_WITH_NEW_NAME",
          eventToUpdate.timestamp = new Date().toISOString();
          eventToUpdate.type = "STREAM";
        }

        if ('active_strategy_id' in event) {
          streamToUpdate.latest_strategy_id = event.latest_strategy_id;
        }

    console.log("sendStreamCreated: appendEventToFile", eventToUpdate.id);

    appendEventToFile(eventToUpdate.id, eventToUpdate);

    // project the new stream
    await projectStreamToSupabase(eventToUpdate);

    return eventToUpdate;
  } catch (error) {
    console.error('sendStreamUpdated: Error saving to event source:', error);
    throw error;
  }
};

export const replayStream = (streamId) => {
  const filteredEvents = getEventsForStream(streamId);
  console.log("Replay Stream with events:", filteredEvents);

  const newFilteredEvents = filteredEvents.filter(
    (event) => event.type === 'STREAM' && event.id === streamId
  );

  const aggregate = newFilteredEvents.reduce((currentAggregate, event) => {
    switch (event.event) {
      case 'STREAM_CREATED':
        return {
          ...currentAggregate,
          id: event.id,
          radarId: event.radarId,
          name: event.name,
          timestamp: event.timestamp,
          state: event.state,
          active_strategy_id: event.active_strategy_id || null,
        };

      case 'STREAM_WITH_LATEST_STRATEGY_VERSION_UPDATED':
        return {
          ...currentAggregate,
          active_strategy_id: event.active_strategy_id,
          timestamp: event.timestamp,
        };

      default:
        console.warn(`Unhandled event type: ${event.type}`);
        return currentAggregate;
    }
  }, {});

  console.log("Replay Stream - Rehydrated aggregate:", aggregate);
  return aggregate;
};

