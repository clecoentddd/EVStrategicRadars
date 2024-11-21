import { config } from 'dotenv';
config();

// Check .env.local are picked up
console.log('RadarTest URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('RadarTest Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

import { handleRadarCreation } from "../../radars/model/radars"; // Import the function
import { clearEventStore } from "../../radars/infrastructure/eventStore"; // Import the helper to clear events
import { getEvents } from "../../radars/infrastructure/eventStore"; 

const radarName = "OOO232"; // Change the radar name here for all tests

// Clear event store before tests run
beforeAll(async () => {
  console.log("Clearing all events before tests...");
  await clearEventStore();
});

describe("Radar Creation Tests", () => {
  test("should create a new radar", async () => {
    const command = {
      payload: {
        name: radarName,
        description: "Top radar of the company",
        level: 1,
      },
    };

    // Call the function directly without the API
    const result = await handleRadarCreation(command);

    // Check if the radar was successfully created
    console.log("Debugging UUIDs:", result);
    console.log("Result UUID:", result.radar.aggregate_id);
    console.log("Radar Aggregate ID:", result.radar.aggregate_id);
    expect(result.success).toBe(true);
    expect(result.radar).toHaveProperty("aggregate_id"); // Updated to reflect aggregate_id
    expect(result.radar.name).toBe(radarName);
    expect(result.radar.description).toBe("Top radar of the company");
    expect(result.radar.level).toBe(1);
  
    // Validate the event is saved correctly
    const events = await getEvents();
    expect(events.length).toBe(1); // Check if only one event exists
    expect(events[0].type).toBe("CREATE_RADAR");
    expect(events[0].payload.name).toBe(radarName);
    expect(events[0].payload.aggregate_id).toBe(result.radar.aggregate_id); // Ensure the event has the correct uuid
    // Debugging: Log values to verify UUIDs
  });

  test("should not allow duplicate radar names", async () => {
    // Creating the first radar
    const command1 = {
      payload: {
        name: radarName,
        description: "Another radar",
        level: 1,
      },
    };

    await handleRadarCreation(command1); // This should succeed

    // Attempt to create a radar with the same name
    const command2 = {
      payload: {
        name: radarName, // Duplicate name
        description: "Duplicate radar",
        level: 2,
      },
    };

    const result = await handleRadarCreation(command2); // This should fail

    // Check that it fails with the appropriate message
    expect(result.success).toBe(false);
    expect(result.message).toBe("Radar name must be unique");

    // Verify that no new events were added
    const events = await getEvents();
    expect(events.length).toBe(1); // Only the first event should be saved
  });
});
