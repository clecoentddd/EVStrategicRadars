import { projectStreamToSupabase } from "./ProjectionStreams";
import { projectStrategyToSupabase } from "./ProjectionStrategies";
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
      radar_id: event.radar_id,
      name: event.name,
      timestamp: new Date().toISOString(),
      state: 'Open',
      active_strategy_id: null,
    };

    console.log("sendStreamCreated: appendEventToFile", streamEvent);

    appendEventToFile(streamEvent.id, streamEvent);
    return streamEvent;
  } catch (error) {
    console.error('sendStreamCreated: Error saving to event source:', error);
    throw error;
  }
};

export const sendStrategyCreated = async (event) => {
  console.log("ES - sendStrategyCreated entering...");
  try {
    const currentStream = replayStream(event.stream_id);

    let new_version = 1;
    let previous_strategy_id = null;

    if (currentStream.active_strategy_id) {
      const currentStrategy = await replayStrategy(currentStream.active_strategy_id);
      new_version = currentStrategy.version + 1;
      previous_strategy_id = currentStrategy.id;
    }

    if (new_version > 1) {
      const closeStrategy = {
        event: 'STRATEGY_CLOSED',
        id: previous_strategy_id,
        stream_id: currentStream.id,
        timestamp: new Date().toISOString(),
        state: 'Closed',
      };

      console.log("sendStreamCreated: appendEventToFile", streamEvent);
      appendEventToFile(currentStream.id, closeStrategy);

      // Add projection
      console.log("Or Am I there?");
      const projectionCloseStrategyResult = await projectStrategyToSupabase(closeStrategy);
      console.log ("projectionCloseStrategyResult", projectionCloseStrategyResult );
    }

    const newStrategy = {
      event: "STRATEGY_CREATED",
      type: "STRATEGY",
      stream_id: event.stream_id,
      id: uuidv4(),
      previous_strategy_id,
      version: new_version,
      timestamp: new Date().toISOString(),
      state: 'Open',
      name: event.name,
      description: event.description,
    };

    const updatedStreamWithNewStrategyId = {
      event: "STREAM_WITH_LATEST_STRATEGY_VERSION_UPDATED",
      type: "STREAM",
      id: currentStream.id,
      active_strategy_id: newStrategy.id,
      timestamp: new Date().toISOString(),
    };

    // Ready to add events to file
    console.log ("appendEventToFile", currentStream.id);
    appendEventToFile(currentStream.id, newStrategy);
    appendEventToFile(currentStream.id, updatedStreamWithNewStrategyId);

    // handle projections
    console.log("Am I here?", newStrategy);
    
    await projectStreamToSupabase(updatedStreamWithNewStrategyId);

    await projectStrategyToSupabase(newStrategy);
    // console.log ('projectionStrategyResult', projectionStrategyResult);

    return newStrategy;
  } catch (error) {
    console.error('sendStrategyCreated: Error saving to event source:', error);
    throw error;
  }
};

export const replayStream = (streamId) => {
  const filteredEvents = getEventsForStream(streamId);
  console.log("Replay Stream with events:", filteredEvents);

  const aggregate = filteredEvents.reduce((currentAggregate, event) => {
    switch (event.event) {
      case 'STREAM_CREATED':
        return {
          ...currentAggregate,
          id: event.id,
          radar_id: event.radar_id,
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

export const replayStrategy = async (strategyId) => {
  const allEvents = await getStrategiesFromEventSource();
  const filteredEvents = allEvents.filter(event => event.id === strategyId);

  const aggregate = filteredEvents.reduce((currentAggregate, event) => {
    switch (event.type) {
      case 'STRATEGY_CREATED':
        return {
          ...currentAggregate,
          id: event.id,
          stream_id: event.stream_id,
          previous_strategy_id: event.previous_strategy_id,
          version: event.version,
          timestamp: event.timestamp,
          state: event.state,
          name: event.name,
          description: event.description,
        };

      case 'STRATEGY_CLOSED':
        return {
          ...currentAggregate,
          state: event.state,
          timestamp: event.timestamp,
        };

      default:
        console.warn(`Unhandled event type: ${event.type}`);
        return currentAggregate;
    }
  }, {});

  console.log("Replay Strategy - Rehydrated aggregate:", aggregate);
  return aggregate;
};
