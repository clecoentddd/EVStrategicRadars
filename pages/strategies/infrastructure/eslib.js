import { supabase } from "../../../utils/supabaseClient";

// Helper function to read events from Supabase
export async function readEventsFromEventSourceDB(streamId) {
  console.log('readEventsFromEventSourceDB entering', streamId);

  try {
    const { data, error } = await supabase
      .from('strategy_events') // Use the new table name
      .select('*')
      .eq('aggregateId', streamId);

    if (error) {
      console.error('Error reading events from Supabase:', error);
      return []; // Return an empty array if there's an error
    }

    console.log('readEventsFromEventSourceDB:', data);
    return data || []; // Return the data or an empty array if no data is found
  } catch (error) {
    console.error('Error reading events from Supabase:', error);
    return []; // Return an empty array if there's an error
  }
}


// Get events for a specific stream
export async function getEventsForStream(streamId) {
  return await readEventsFromEventSourceDB(streamId);
}

// Add an event to Supabase
export async function appendEventToEventSourceDB(event) {
  try {
    console.log("Append Stream event to ES: ", event);
    const { data, error } = await supabase
      .from('strategy_events') // Use the new table name
      .insert([
        {
          aggregateId: event.aggregateId,
          eventType: event.eventType, // Store the event type
          timestamp: event.timestamp, // Store the timestamp
          aggregateType: event.aggregateType, // Store the aggregate type
          payload: event.payload, // Store the payload as JSON
        },
      ])
      .select();

    if (error) {
      console.error('Error appending event to Supabase:', error);
    } else {
      console.log('Event appended successfully to Supabase for stream:', event.aggregateId);
      console.log("appendEventToEventSourceDB: Event stored successfully", data);
       return data;
    }
  } catch (error) {
    console.error('Error appending event to Supabase:', error);
  }

}

// Clear all events in the event store
export async function clearEventStore() {
  try {
    const { error } = await supabase
      .from('strategy_events') // Use the new table name
      .delete()
      .neq('aggregateId', ''); // Delete all events

    if (error) {
      console.error('Error clearing event store:', error);
    } else {
      console.log('Event store cleared.');
    }
  } catch (error) {
    console.error('Error clearing event store:', error);
  }
}

// Get the total number of events in the event store
export async function getNumberOfEvents() {
  try {
    const { count, error } = await supabase
      .from('strategy_events') // Use the new table name
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error getting number of events:', error);
      return 0;
    }

    console.log('Total number of events:', count);
    return count || 0;
  } catch (error) {
    console.error('Error getting number of events:', error);
    return 0;
  }
}