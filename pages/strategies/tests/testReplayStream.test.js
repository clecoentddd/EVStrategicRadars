import { replayStream } from '../infrastructure/eventStoreStream'; // Adjust the import path
import fs from 'fs';
import path from 'path';

const dataDirectory = path.join(__dirname, 'data'); // Directory containing the test data files
const eventsDirectory = path.join(__dirname, '../events'); // Target directory for event files

describe('replayStream', () => {
  const stream_id = '84026ea5-f07d-4b15-92d3-72c2ddaf8bde';
  const radarId = '9573ace9-48f7-4410-9b21-3e52a3be3e7a';
  const active_strategy_id = 'a18fe481-1a9f-4244-b97d-064857bac924';
  const name = 'Strategy Stream v1.0'
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
  it('should correctly replay the stream and reconstruct its aggregate state', () => {
    // Call the replayStream function
    const aggregate = replayStream(stream_id);

    // Verify the aggregate state
    expect(aggregate).toEqual({
      id: stream_id,
      radarId: radarId,
      name: name,
      state: 'Open',
      active_strategy_id: active_strategy_id,
      timestamp: '2024-12-11T21:47:27.552Z' // to add timestamp when I do the update
    });
  });
});
