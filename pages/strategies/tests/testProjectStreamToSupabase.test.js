import { projectStreamToSupabase } from "../infrastructure/ProjectionStreams"; // Adjust path as necessary
import { supabase } from "../../../utils/supabaseClient"; // Adjust path as necessary
import { v4 as uuidv4 } from 'uuid';

describe('Supabase Stream Tests', () => {
  let streamId;

  

  // Test to create a new stream in Supabase
  it('should create a stream in Supabase', async () => {
    streamId = uuidv4();
    const streamCommand = {
      id: streamId , // Make sure to set a unique ID
      radar_id: '9573ace9-48f7-4410-9b21-3e52a3be3e00',
      type: "STREAM",
      name: 'Test Stream for Supabase',
      description: 'A test stream for Supabase integration',
      level: '1',
      event: 'STREAM_CREATED' // This is the event type for creation
    };

    // Call the function to project the stream to Supabase
    const savedStream = await projectStreamToSupabase(streamCommand);

    // streamId = savedStream[0].id; // Assuming the response contains the ID of the inserted stream
    console.log ("Checking returned streamID", savedStream[0]);
    expect(savedStream).toBeDefined();
    expect(savedStream[0].id).toBe(streamId);
    console.log("Stream created successfully:", savedStream);
  });

  // Test to update the stream in Supabase
  it('should update an existing stream in Supabase', async () => {
    console.log (" Checking uuid of stream id", streamId);
    const updatedStreamCommand = {
      id: streamId, // Use the ID from the previous test
      active_strategy_id: '9573ace9-48f7-4410-9b21-3e52a3be3111',
      state: 'updated', // New state
      event: 'STREAM_WITH_LATEST_STRATEGY_VERSION_UPDATED' // Event for updating stream
    };

    // Call the function to update the stream in Supabase
    const updatedStream = await projectStreamToSupabase(updatedStreamCommand);

    expect(updatedStream).toBeDefined();
    expect(updatedStream[0].active_strategy_id).toBe(updatedStreamCommand.active_strategy_id);
    expect(updatedStream[0].state).toBe(updatedStreamCommand.state);
    console.log("Stream updated successfully:", updatedStream);
  });
});
