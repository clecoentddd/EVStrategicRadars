import { replayElement } from '../infrastructure/eventStoreElements'; // Adjust the import path
import fs from 'fs';
import path from 'path';

const dataDirectory = path.join(__dirname, 'data'); // Directory containing the test data files
const eventsDirectory = path.join(__dirname, '../events'); // Target directory for event files

describe('replayStrategy', () => {
  const stream_id = '84026ea5-f07d-4b15-92d3-72c2ddaf8bde';
  const radar_id = '9573ace9-48f7-4410-9b21-3e52a3be3e7a';
  const active_strategy_id = 'a18fe481-1a9f-4244-b97d-064857bac924';
  const strategy_id = 'a18fe481-1a9f-4244-b97d-064857bac924';
  const element_id = '65b3b1fa-f07e-4dee-917f-6781a14a297c';
  const element_name = 'Unbalanaced Risk';
  const testFilePath = path.join(dataDirectory, `${stream_id}.json`);
  const targetFilePath = path.join(eventsDirectory, `${stream_id}.json`);

  console.log ("Target is",targetFilePath );

  // Copy test files to the events directory before tests run
  beforeAll(() => {
    if (!fs.existsSync(eventsDirectory)) {
      fs.mkdirSync(eventsDirectory, { recursive: true });
    }
    console.log ("Should be copying...", testFilePath);
    fs.copyFileSync(testFilePath, targetFilePath);
    console.log (" Coyping to",targetFilePath );
  });

  // Clean up the events directory after tests
  /* afterAll(() => {
    if (fs.existsSync(targetFilePath)) {
      fs.unlinkSync(targetFilePath);
    }
  }); */

  console.log("Cruising along?");
  it('should correctly replay the stream and reconstruct its aggregate state', async () => {
    // Call the replayStream function
    const aggregate_to_fetch = {
      stream_id: stream_id,
      id: element_id,

    }
    const aggregate = await replayElement(aggregate_to_fetch);

    // Verify the aggregate state
    console.log("Aggregate is", aggregate);
    expect(aggregate.state).toBe("Deleted");
    expect(aggregate.event).toBe("STRATEGIC_ELEMENT_DELETED");
    expect(aggregate.id).toBe(element_id);
    expect(aggregate.timeStamp).toEqual("2024-12-11T21:27:03.806Z");
      /*name: element_name,
      type: 'STRATEGIC_ELEMENT',
      state: 'Deleted',
      strategy_id: active_strategy_id */ // to add timestamp when I do the update
  });
});
