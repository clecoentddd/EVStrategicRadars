import { supabase } from "../../../utils/supabaseClient";
import { v4 as uuidv4 } from 'uuid';
import eventStoreInitiatives from "../../strategies/infrastructure/eventStoreInitiatives";

// Get events for a specific radar
export async function getEventsForAnOrganisation(organisationId) {
  
  console.log ("getEventsForAnOrganisation", organisationId);
  const { data, error } = await supabase
    .from('organisation_events')
    .select('payload, eventType, created_at')
    .eq('aggregateId', organisationId)
    .eq('aggregateType', 'RADAR'); // Add filter for aggregateType

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  console.log ("getEventsForAnOrganisation: events retreived", data);

  return data.map((row) => ({
    payload: row.payload,
    eventType: row.eventType, // Include eventType in the return object
    created_at: row.created_at // Include the created_at value
  }));
}


export async function getEventsForRadarItem(radarItemId) {
  
  console.log ("getEventsForRadarItem", radarItemId);
  const { data, error } = await supabase
    .from('radar_items_events')
    .select('payload, eventType, created_at')
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
    created_at: row.created_at // Include the created_at value
  }));
}
// Add an event to the database
export async function appendEventToRadatIemEventSourceDB(event) {

 
  console.log("appendEventToRadatIemEventSourceDB", event);

  const { data, error } = await supabase
    .from('radar_items_events')
    .insert([event])
    .select();

  if (error) {
    console.error('Error inserting event in Radar Item Event Source DB:', error);
    return null;
  }

  return data[0];
}

export async function appendEventToOrganisationsEventSourceDB(event) {

 
  console.log("appendEventToOrganisationsEventSourceDB", event);

  const { data, error } = await supabase
    .from('organisation_events')
    .insert([event])
    .select();

  if (error) {
    console.error('Error inserting event:', error);
    return null;
  }

  return data[0];
}