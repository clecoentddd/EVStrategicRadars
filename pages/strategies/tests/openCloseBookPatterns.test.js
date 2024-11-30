// test.js
import {
  saveStrategyToEventSource,
  getStrategiesFromEventSource,
  clearStrategyEventSource,
} from '../infrastructure/eventStore';

describe('Event Store', () => {
  beforeEach(() => {
    clearStrategyEventSource();
  });

  it('should create a new strategy and set version to 0', async () => {
    const createStrategyEvent = {
      type: 'CREATE_STRATEGY',
      payload: {
        // ... other payload data
      }
    };

    const savedEvent = await saveStrategyToEventSource(createStrategyEvent);

    expect(savedEvent.payload.version).toBe(0);
  });

  it('should create a new version of an existing strategy and increment the version', async () => {
    // Create the initial strategy
    const initialEvent = {
      type: 'CREATE_STRATEGY',
      payload: {
        // ... initial payload data
      }
    };
    const initialSavedEvent = await saveStrategyToEventSource(initialEvent);

    // Create a new version
    const newVersionEvent = {
      type: 'NEW_VERSION_OF_STRATEGY',
      payload: {
        aggregate_id: initialSavedEvent.payload.aggregate_id,
      }
    };

    console.log ("New version to save is", newVersionEvent);
    const newVersionSavedEvent = await saveStrategyToEventSource(newVersionEvent);
    console.log ("New version saved is", newVersionSavedEvent);
    expect(newVersionSavedEvent.payload.version).toBe(1);
    expect(newVersionSavedEvent.payload.previous_version_of_strategy).toBe(initialSavedEvent.payload.aggregate_id);
  });
});