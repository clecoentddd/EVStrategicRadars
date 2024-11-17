import { handleRadarCreation } from "../../radars/model/radars"; // Import the function
import { clearEventStore } from "../../radars/infrastructure/eventStore"; // Import the helper to clear events
import { getEvents } from "../../radars/infrastructure/eventStore"; 

// Clear event store before tests run
beforeAll(async () => {
  console.log("Clearing all events before tests...");
  await clearEventStore();
});

describe("Radar Creation Tests", () => {
  test("should create a new radar (OOO)", async () => {
    const command = {
      payload: {
        name: "OOO232",
        description: "Top radar of the company",
        level: 1,
      },
    };

    // Call the function directly without the API
    const result = await handleRadarCreation(command);

    // Check if the radar was successfully created
    expect(result.success).toBe(true);
    expect(result.radar).toHaveProperty("id");
    expect(result.radar.name).toBe("OOO232");
    expect(result.radar.description).toBe("Top radar of the company");
    expect(result.radar.level).toBe(1);
    expect(result.uuid).toBe(result.radar.id); // Ensure that the returned uuid matches the radar's id

    // Validate the event is saved correctly
    const events = await getEvents();
    expect(events.length).toBe(1); // Check if only one event exists
    expect(events[0].type).toBe("CREATE_RADAR");
    expect(events[0].payload.name).toBe("OOO232");
    expect(events[0].payload.id).toBe(result.uuid); // Ensure the event has the correct uuid
  });

  test("should not allow duplicate radar names", async () => {
    // Creating the first radar
    const command1 = {
      payload: {
        name: "OOO232",
        description: "Another radar",
        level: 1,
      },
    };

    await handleRadarCreation(command1); // This should succeed

    // Attempt to create a radar with the same name
    const command2 = {
      payload: {
        name: "OOO232", // Duplicate name
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
