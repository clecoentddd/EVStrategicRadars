import { projectStrategyToSupabase, projectStreamToSupabase } from "./ProjectionStrategies.js";
import {replayStream} from './eventStoreStream.js';
import { v4 as uuidv4 } from 'uuid';
import { 
  appendEventToFile, 
  getEventsForStream, 
} from './eslib.js';


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
      // Add projection (handle errors gracefully)
      try {
        const projectionCloseStrategyResult = await projectStrategyToSupabase(closeStrategy);
        console.log("projectionCloseStrategyResult", projectionCloseStrategyResult);
      } catch (error) {
        console.warn('Warning: Projection of close strategy failed:', error);
      }
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
      state: 'Draft',
      name: event.name,
      description: event.description,
      whatwewillnotdo: event.whatwewillnotdo,
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
    
    // Handle projections (wrap each in a try-catch block)
    try {
      await projectStreamToSupabase(updatedStreamWithNewStrategyId);
    } catch (error) {
      console.warn('Warning: Projection of updated stream failed:', error);
    }

    try {
      await projectStrategyToSupabase(newStrategy);
    } catch (error) {
      console.warn('Warning: Projection of new strategy failed:', error);
    }

    // Always return the new strategy
    return newStrategy;

  } catch (error) {
    console.error('sendStrategyCreated: Error saving to event source:', error);
    throw error;
  }
};

export const replayStrategy = async (streamId, strategyId) => {
  const allEvents = await getEventsForStream(streamId);
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
          whatwewillnotdo: event.whatwewillnotdo,
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
