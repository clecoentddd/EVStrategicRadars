import request from "supertest";
import { clearEventStore } from "../../radars/infrastructure/eventStore"; 

// Assuming the base URL for your application is running on localhost:3000
const baseUrl = "http://localhost:3000"; 

describe("Radar API", () => {

    // Clear events before running all the tests
    beforeAll(async () => {
      console.log("Clearing all events before tests...");
      await clearEventStore(); // Clear all events from the event store
    });


  it("should create a new radar", async () => {
    const command = {
      type: "CREATE_RADAR",
      payload: {
        name: "CEO5",  // First radar name
        description: "Top radar of the company",
        level: 1,
      },
    };

    const res = await request(baseUrl)
      .post("/api/radars")
      .send(command);

    console.log("Create Radar Response:", res.body);  // Log the response

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should not allow duplicate radar names", async () => {
    const command = {
      type: "CREATE_RADAR",
      payload: {
        name: "CEO5",  // Same name to trigger the duplicate check
        description: "Another radar",
        level: 1,
      },
    };

    // Log the existing radars before trying to create a duplicate radar
    const existingRadars = await request(baseUrl).get("/api/radars");
    console.log("Existing Radars Before Creating CEO2:", existingRadars.body); 

    const res = await request(baseUrl)
      .post("/api/radars")
      .send(command);

    console.log("Duplicate Radar Response:", res.body);  // Log the response
    console.log("Duplicate Radar Status:", res.status); // Log the status code

    expect(res.status).toBe(400);  // Expecting 400 for duplicate names
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Radar name must be unique");
  });
});

describe("Example Test", () => {
  it("should pass", async () => {
    // Mocking a simple GET request to the root endpoint
    const res = await request(baseUrl).get("/");

    // Check that the status code returned is 200
    expect(res.statusCode).toBe(200);
  });
});
