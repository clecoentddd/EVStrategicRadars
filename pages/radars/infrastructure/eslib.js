import { supabase } from "../../../utils/supabaseClient";
import { v4 as uuidv4 } from 'uuid';
import eventStoreInitiatives from "../../strategies/infrastructure/eventStoreInitiatives";

// Get events for a specific radar
export async function getEventsForRadar(radarId) {
  
  console.log ("getEventsForRadar", radarId);
  const { data, error } = await supabase
    .from('radar_events')
    .select('payload, eventType')
    .eq('aggregateId', radarId)
    .eq('aggregateType', 'RADAR'); // Add filter for aggregateType

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  console.log ("getEventsForRadar: events retreived", data);

  return data.map((row) => ({
    payload: row.payload,
    eventType: row.eventType, // Include eventType in the return object
  }));
}


export async function getEventsForRadarItem(radarItemId) {
  
  console.log ("getEventsForRadarItem", radarItemId);
  const { data, error } = await supabase
    .from('radar_events')
    .select('payload, eventType')
    .eq('aggregateId', radarItemId)
    .eq('aggregateType', 'RADAR_ITEM'); // Add filter for aggregateType

  if (error) {
    console.error(': getEventsForRadarItemError fetching events:', error);
    return [];
  }

  console.log ("getEventsForRadarItem: events retreived", data);

  return data.map((row) => ({
    payload: row.payload,
    eventType: row.eventType, // Include eventType in the return object
  }));
}
// Add an event to the database
export async function appendEventToEventSourceDB(event) {

 
  console.log("appendEventToEventSourceDB", event);

  const { data, error } = await supabase
    .from('radar_events')
    .insert([event])
    .select();

  if (error) {
    console.error('Error inserting event:', error);
    return null;
  }

  return data[0];
}

// Read an event by its eventStoreId
export async function readEventByEventStoreId(radarId, eventStoreId) {
  const { data, error } = await supabase
    .from('radar_events')
    .select('payload')
    .eq('radar_id', radarId)
    .eq('id', eventStoreId)
    .single();

  if (error) {
    console.error('Error fetching event by ID:', error);
    return null;
  }

  return data.payload;
}

// Clear all events for a radar
export async function clearEventStore(radarId) {
  const { error } = await supabase
    .from('radar_events')
    .delete()
    .eq('radar_id', radarId);

  if (error) {
    console.error('Error clearing events:', error);
    return false;
  }

  console.log('Event store cleared.');
  return true;
}

// Get the total number of events for a radar
export async function getNumberOfEvents(radarId) {
  const { count, error } = await supabase
    .from('radar_events')
    .select('*', { count: 'exact' })
    .eq('radar_id', radarId);

  if (error) {
    console.error('Error counting events:', error);
    return 0;
  }

  return count;
}