import { request } from 'http'; // Use the native `http` module
import { expect } from '@jest/globals'; // Use Jest's expect function for assertions

// Helper function for HTTP requests
const makeRequest = (url, method, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    const req = request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data)); // Parse the JSON response
          } catch (error) {
            reject(new Error(`Error parsing response JSON: ${error.message}`));
          }
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Request failed: ${e.message}`));
    });

    // If there's a body, write it to the request
    if (body) {
      try {
        req.write(JSON.stringify(body));
      } catch (error) {
        reject(new Error(`Error stringifying body: ${error.message}`));
      }
    }

    req.end();
  });
};

test('Radar item creation test', async () => {
  // Initialize test state
  const state = {
    radarItems: {},
  };

  try {
    // Given: a radar item for the radar with id "1ab3675e-91f9-40b8-a0db-e3b4a474d299"
    const item = {
      name: "Practice",
      description: "A practice radar item",
      category: "category1",
      distance: "dist1",
      type: "opportunity", // Assuming the type is "opportunity"
      tolerance: "medium",
      impact: "high",
      distance: "short",
      radar_id: "1ab3675e-91f9-40b8-a0db-e3b4a474d299", // Using the specified radar_id
    };

    // Ensure that the POST request to create the radar item is awaited
    const createdItem = await makeRequest('http://localhost:3000/api/radar-items', 'POST', item);
    
    console.log("CreatedItem is", createdItem);

    // Then: The created radar item should have the expected radar_id
    expect(createdItem.radar_id).toBe(item.radar_id); // Using Jest's expect for assertion

  } catch (err) {
    // Catch any errors from async operations and fail the test
    expect(err).toBeNull(); // Fail the test if there's an error
  }
}, 15000);
