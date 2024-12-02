// import { describe, it, expect } from 'jest';
import { CreateStrategyStream, CreateNewVersionOfStrategy, GetStrategyById } from '../model/strategy';

describe('Strategy Stream Tests', () => {
  it('should create a new stream and initial strategy', async () => {
    const streamCommand = {
      radar_id: 'radar-123',
      name: 'Test Strategy Stream',
      description: 'Description of the test strategy stream',
      level: '1',
    };

    const savedStream = await CreateStrategyStream(streamCommand);

    expect(savedStream.state).toBe('Open');

    const firstVersionCommand = {
      stream_id: savedStream.stream_id,
      name: 'First Version of Strategy',
      description: 'Description of the first version of the strategy',
      period: '2025',
    };

    const firstVersion = await CreateNewVersionOfStrategy(firstVersionCommand);

    expect(firstVersion.state).toBe('Open');

    const secondVersionCommand = {
      stream_id: firstVersion.stream_id,
      name: 'Second Version of Strategy',
      description: 'Description of the second version of the strategy',
      period: '2026'
    };

    const secondVersion = await CreateNewVersionOfStrategy(secondVersionCommand);

    const previousVersionShouldBeClose = await GetStrategyById(firstVersion.aggregate_id)

    console.log ("First version should be closed",previousVersionShouldBeClose );
    expect(secondVersion.state).toBe('Open');
  });
});