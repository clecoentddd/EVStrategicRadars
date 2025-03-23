// pages/radars/infrastructure/radarItemsDB.js

import { supabase } from "../../../utils/supabaseClient";  // Import Supabase client

/**
 * Fetch all radar items by radarId from the database.
 * @param {string} radarId - The aggregate ID of the radar.
 * @returns {Promise<Array>} The list of radar items for the specified radarId.
 */
export async function fetchAllRadarItemsByRadarId(radarId) {
  try {
    console.log ("radarItemsDB: get all radar items for radar id", radarId);
    // Query the radar_items table for all items with the given radarId
    const { data, error } = await supabase
      .from("projection_radar_items_list")
      .select("*")
      .eq("radarId", radarId);  // Filter by radarId

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
