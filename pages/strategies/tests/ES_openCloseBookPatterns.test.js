import {
  sendNewStreamCreated,
  sendNewStrategyCreated,
  getStrategiesFromEventSource,
  clearStrategyEventSource,
  getEventsForStream
} from '../infrastructure/eventStoreStream';

describe('Event Store', () => {
  let createdStreamId;

  beforeEach(() => {
    //clearStrategyEventSource();
  });

  it('should create a new stream and initial strategy', async () => {
    const streamCreatedEvent = {
      type: 'STRATEGY_STREAM_CREATED',
      radar_id: 'some_radar_id',
      name: 'Initial Strategy',
    };
    
    const strategyStream = await sendNewStreamCreated(streamCreatedEvent);

    const strategies = getStrategiesFromEventSource();
    //console.log("test: ", strategies)
    createdStreamId =  strategyStream.stream_id;
    //expect(strategies.length).toBe(0);
    //expect(strategies[0].version).toBe(0);
    expect(createdStreamId !== null);
  });

  it('should create a new strategy version', async () => {
    // Create the initial strategy
    //console.log("Creating first strategy for stream id", createdStreamId);
    const initialStrategyEvent = {
      stream_id: createdStreamId,
      name: 'Initial Strategy',
      type: 'STRATEGY_NEW_VERSION_CREATED', 
      description: 'First strategy for 2025',
    };
    const newStrategySaved = await sendNewStrategyCreated(initialStrategyEvent);

    const strategies1 = getStrategiesFromEventSource();
    // console.log("test first strategy: ", strategies1);
    //console.log ("version of the new strategy is:" , newStrategySaved.version);

    // Create a new version of the strategy
    const newVersionEvent = {
      type: 'STRATEGY_NEW_VERSION_CREATED',
      stream_id: createdStreamId,
      name: 'Second Strategy',
    };

    const newStrategySaved1 = await sendNewStrategyCreated(newVersionEvent);

    const strategies = getStrategiesFromEventSource();
    //console.log("Second version of strategy: ", strategies);

    const eventList = getEventsForStream(createdStreamId);
    
    //console.log("second strategy:", newStrategySaved1);

    //console.log ("All events in ES : ", eventList);
    expect(newStrategySaved1.version).toBe(2);

  });
});