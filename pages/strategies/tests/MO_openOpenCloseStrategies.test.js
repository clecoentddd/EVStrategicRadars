// import { describe, it, expect } from 'jest';
import { CreateStream, CreateNewStrategy, GetStrategyById } from '../model/strategy';

let streamId;
let firstStrategyId;

describe('Strategy Stream Tests', () => {
  it('should create a new stream', async () => {
    const streamCommand = {
      radarId: 'radar-123',
      name: 'Test Strategy Stream',
      description: 'Description of purpose',
      level: '1',
    };

    const savedStream = await CreateStream(streamCommand);

    streamId = savedStream.id;

    expect(savedStream.state).toBe('Open');
    expect (streamId).not.toBeNull();

  });

  it('should create a first strategy', async () => {

    const command = {
      stream_id: streamId,
      name: 'First Version of Strategy',
      description: 'Description of the first version of the strategy',
      period: '2025',
    };

    const strategy = await CreateNewStrategy(command);

    expect(strategy.state).toBe('Open');

    firstStrategyId = strategy.id;

  });

  it('should create a second version', async () => {
    
    const command = {
      stream_id: streamId,
      name: 'Second Version of Strategy',
      description: 'Description of the purpose V2',
      period: '2026'
    };

    const strategy = await CreateNewStrategy(command);

    const previousStrategy = await GetStrategyById(firstStrategyId)

    expect(strategy.state).toBe('Open');
    expect(previousStrategy.state).toBe('Closed');
  });
});