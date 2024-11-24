// pages/radars/infrastructure/radarItemsDB.js

import { supabase } from "../../../utils/supabaseClient";  // Import Supabase client

/**
 * Fetch all radar items by radar_id from the database.
 * @param {string} radar_id - The aggregate ID of the radar.
 * @returns {Promise<Array>} The list of radar items for the specified radar_id.
 */
export async function fetchAllRadarItemsByRadarId(radar_id) {
  try {
    console.log ("radarItemsDB: get all radar items for radar id", radar_id);
    // Query the radar_items table for all items with the given radar_id
    const { data, error } = await supabase
      .from("radar_items")
      .select("*")
      .eq("radar_id", radar_id);  // Filter by radar_id

    console.log ("radarItemsDB: get all radar items for radar id: job done?", error);
    // If there's an error, throw it
    if (error) {
      console.error("Error fetching radar items:", error.message);
      throw new Error("Failed to fetch radar items");
    }

    // Return the fetched data (an array of radar items)
    console.log ("radarItemsDB: get all radar items -> data", data);
    return data;
  } catch (error) {
    console.error("Unexpected error:", error.message);
    throw new Error("Error fetching radar items");
  }
}
