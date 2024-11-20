import { supabase } from "../../../utils/supabaseClient"; // Supabase client library
import { v4 as uuidv4 } from "uuid"; // UUID generator for creating radar item id

/**
 * Project a radar item creation event into the Supabase "radar_items" table.
 * @param {Object} radarItem - The radar item object containing radar_id, name, description, type, category, impact, cost, zoom_in, etc.
 * @returns {Promise<Object>} The result of the Supabase insert operation.
 */
export async function projectRadarItemToSupabase(radarItem) {
  try {
    // Check .env.local values
    console.log('radarItemProjection URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('radarItemProjection Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    // Generate a unique ID for the radar item
    const radarItemId = uuidv4();

    // Insert the radar item into the "radar_items" table
    const { data, error } = await supabase
      .from("radar_items")
      .insert([
        {
          radar_item_id: radarItem.radar_item_id,
          radar_id: radarItem.radar_id,
          name: radarItem.name,
          description: radarItem.description,
          type: radarItem.type,
          category: radarItem.category,
          impact: radarItem.impact,
          cost: radarItem.cost,
          zoom_in: radarItem.zoom_in || null, // Optional field
          created_at: new Date().toISOString(), // Set creation time
        },
      ]);

    // Check for errors
    if (error) {
      console.log("Error projecting radar item to Supabase:", error.message);
      throw new Error("Failed to project radar item to Supabase.");
    }

    console.log("Radar item successfully projected to Supabase:", data);
    return data;
  } catch (err) {
    console.log("Unexpected error in projecting radar item:", err.message);
    throw err;
  }
}

/**
 * Test Supabase connection by querying the "radar_items" table.
 */
export async function testRadarItemConnection() {
  try {
    console.log('ES3 radarItemProjections URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('ES3 radarItemProjections Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const { data, error } = await supabase.from("radar_items").select("*");

    if (error) {
      console.log('ES3 radarItemProjections URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log("Supabase connection test failed:", error.message);
      throw new Error("Supabase connection failed.");
    }

    console.log("Supabase connection successful:", data);
    return data;
  } catch (err) {
    console.log("Unexpected error in testRadarItemConnection:", err.message);
    throw err;
  }
}
