import fs from 'fs';
import path from 'path';
import { supabase } from '../utils/supabaseClient.js'; // Import your Supabase client

const eventsDirectory = path.join(process.cwd(), process.env.EVENTS_DIRECTORY || 'pages/radars/_events');

// Helper function to read events from a file
function readEventsFromFile(radarId) {
  const filePath = path.join(eventsDirectory, `${radarId}.json`);

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading events from file ${filePath}:`, error);
    return []; // Return an empty array if the file doesn't exist or fails to read
  }
}

// Function to insert events into Supabase
async function insertEventsIntoSupabase(radarId, events) {
  for (const event of events) {
    try {
      const { data, error } = await supabase
        .from('radar_events')
        .insert([
          {
            id: event.eventStoreId, // Use the existing eventStoreId as the primary key
            radar_id: radarId,
            payload: event, // Store the entire event object in the payload column
            created_at: new Date(event.timestamp).toISOString(), // Convert timestamp to ISO format
          },
        ])
        .select();

      if (error) {
        console.error(`Error inserting event ${event.eventStoreId}:`, error);
      } else {
        console.log(`Event ${event.eventStoreId} inserted successfully:`, data);
      }
    } catch (error) {
      console.error(`Unexpected error inserting event ${event.eventStoreId}:`, error);
    }
  }
}

// Main function to migrate events
async function migrateEvents() {
  // Get all radar IDs from the events directory
  const files = fs.readdirSync(eventsDirectory);

  for (const file of files) {
    if (file.endsWith('.json')) {
      const radarId = file.replace('.json', ''); // Extract radar ID from the filename
      console.log(`Migrating events for radar ${radarId}...`);

      // Read events from the file
      const events = readEventsFromFile(radarId);
      if (events.length === 0) {
        console.log(`No events found for radar ${radarId}.`);
        continue;
      }

      // Insert events into Supabase
      await insertEventsIntoSupabase(radarId, events);
      console.log(`Migration completed for radar ${radarId}.`);
    }
  }

  console.log('All events migrated successfully.');
}

// Run the migration
migrateEvents().catch((error) => {
  console.error('Migration failed:', error);
});