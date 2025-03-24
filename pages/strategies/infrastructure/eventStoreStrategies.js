import { projectStrategyToSupabase } from "./ProjectionStrategies.js";
import { projectStreamToSupabase } from "./ProjectionStreams.js";
import { replayStream } from './eventStoreStream.js';
import { v4 as uuidv4 } from 'uuid';
import { appendEventToEventSourceDB, readEventsFromEventSourceDB } from './eslib.js';

/**
 * Send a STRATEGY_CREATED event.
 */
export const sendStrategyCreated = async (event) => {
  console.log("ES - sendStrategyCreated entering...", event);
  try {
    const currentStream = await replayStream(event.stream_id);
    console.log("ES - sendStrategyCreated entering...Stream is: ", currentStream);

    let new_version = 1;
    let previous_strategy_id = null;

    if (currentStream.active_strategy_id) {
      const currentStrategy = await replayStrategy( currentStream.active_strategy_id);
      console.log("ES - sendStrategyCreated entering...Current strategy is: ", currentStrategy);
      new_version = currentStrategy.version + 1;
      previous_strategy_id = currentStrategy.id;
    }

    if (new_version > 1) {
      const closeStrategyEvent = {
        aggregateType: 'STRATEGY', // Aggregate type
        aggregateId: previous_strategy_id, // Aggregate ID
        eventType: 'STRATEGY_CLOSED', // Event type
        timestamp: new Date().toISOString(), // Timestamp
        payload: {
          state: "Closed",
        },
      };

      console.log("sendStrategyCreated: appendEventToEventSourceDB", closeStrategyEvent);
      await appendEventToEventSourceDB(closeStrategyEvent);

      // Projection (handle errors gracefully)
      try {
        const projectionCloseStrategyResult = await projectStrategyToSupabase(closeStrategyEvent);
        console.log("projectionCloseStrategyResult", projectionCloseStrategyResult);
      } catch (error) {
        console.warn('Warning: Projection of close strategy failed:', error);
      }
    }

    const newStrategyEvent = {
      aggregateType: 'STRATEGY', // Aggregate type
      aggregateId: uuidv4(), // New strategy ID
      eventType: 'STRATEGY_CREATED', // Event type
      timestamp: new Date().toISOString(), // Timestamp
      payload: {
        // id: uuidv4(),
        version: new_version,
        state: "Draft",
        name: event.name,
        description: event.description,
        whatwewillnotdo: event.whatwewillnotdo,
        stream_id: event.stream_id, // Include stream ID in payload
        previous_strategy_id: previous_strategy_id,
      },
    };

    const updatedStreamEvent = {
      aggregateType: 'STREAM', // Aggregate type
      aggregateId: event.stream_id, // Stream ID
      eventType: 'STREAM_STRATEGY_UPDATED', // Event type
      timestamp: new Date().toISOString(), // Timestamp
      payload: {
        active_strategy_id: newStrategyEvent.aggregateId, // New strategy ID
      },
    };

    // Append events to the event store
    console.log("appendEventToEventSourceDB: newStrategyEvent: ", newStrategyEvent);
    await appendEventToEventSourceDB(newStrategyEvent);

    console.log("appendEventToEventSourceDB: updatedStreamEvent: ", updatedStreamEvent);
    await appendEventToEventSourceDB(updatedStreamEvent);

    // Handle projections (wrap each in a try-catch block)
    try {
      await projectStreamToSupabase(updatedStreamEvent);
    } catch (error) {
      console.warn('Warning: Projection of updated stream failed:', error);
    }

    try {
      await projectStrategyToSupabase(newStrategyEvent);
    } catch (error) {
      console.warn('Warning: Projection of new strategy failed:', error);
    }

    // Always return the new strategy
    return newStrategyEvent;

  } catch (error) {
    console.error('sendStrategyCreated: Error saving to event source:', error);
    throw error;
  }
};

/**
 * Send a STRATEGY_UPDATED event.
 */
export const sendStrategyUpdated = async (event) => {
  console.log("ES - sendStrategyUpdated entering with event...", event);

  const updatedStrategyEvent = {
    aggregateType: 'STRATEGY', // Aggregate type
    aggregateId: event.id, // Strategy ID
    eventType: 'STRATEGY_UPDATED', // Event type
    timestamp: new Date().toISOString(), // Timestamp
    payload: {
      id: event.id,
      state: event.state,
      name: event.name,
      description: event.description,
      whatwewillnotdo: event.whatwewillnotdo,
      stream_id: event.stream_id, // Include stream ID in payload
    },
  };

  // Append event to the event store
  console.log("ES - appendEventToEventSourceDB", updatedStrategyEvent);
  await appendEventToEventSourceDB(updatedStrategyEvent);

  // Handle projections
  console.log("ES- Am I here?", updatedStrategyEvent);

  try {
    await projectStrategyToSupabase(updatedStrategyEvent);
  } catch (error) {
    console.warn('Warning: Projection of updated strategy failed:', error);
  }

  // Always return the updated strategy
  return updatedStrategyEvent;
};

/**
 * Replay events to rebuild the state of a strategy.
 */
export const replayStrategy = async (strategyId) => {
  console.log('replayStrategy: Replaying events for strategyId:', strategyId);
  const allEvents = await readEventsFromEventSourceDB(strategyId);

  // Filter events for the specific strategy
  const filteredEvents = allEvents.filter(
    (event) => event.aggregateType === 'STRATEGY' && event.aggregateId === strategyId
  );

  // Rehydrate the aggregate by applying events in sequence
  const aggregate = filteredEvents.reduce((currentAggregate, event) => {
    switch (event.eventType) {
      case 'STRATEGY_CREATED':
        return {
          ...currentAggregate,
          id: event.aggregateId,
          stream_id: event.payload.stream_id,
          previous_strategy_id: event.payload.previous_strategy_id,
          version: event.payload.version,
          timestamp: event.timestamp,
          state: event.payload.state,
          name: event.payload.name,
          description: event.payload.description,
          whatwewillnotdo: event.payload.whatwewillnotdo,
        };

      case 'STRATEGY_CLOSED':
        return {
          ...currentAggregate,
          state: event.payload.state,
          timestamp: event.timestamp,
        };

      case 'STRATEGY_UPDATED':
        return {
          ...currentAggregate,
          state: event.payload.state,
          name: event.payload.name,
          description: event.payload.description,
          whatwewillnotdo: event.payload.whatwewillnotdo,
          timestamp: event.timestamp,
        };

      default:
        console.warn(`Unhandled event type: ${event.eventType}`);
        return currentAggregate;
    }
  }, {});

  console.log("Replay Strategy - Rehydrated aggregate:", aggregate);
  return aggregate;
};