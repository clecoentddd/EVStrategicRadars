import { supabase } from "../../../utils/supabaseClient"; // Supabase client library

/**
 * Project a radar item creation event into the Supabase "radar_items" table.
 * @param {Object} radarItem - The radar item object containing radar_id, name, detect, assess, respond, type, category, impact, tolerance, zoom_in, etc.
 * @returns {Promise<Object>} The result of the Supabase insert operation.
 */

export async function projectRadarItemToSupabase(radarItem) {
  try {
    // Check .env.local values
    console.log('radarItemProjection URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('radarItemProjection Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    console.log('Event to supabase', radarItem);

    // Check if the radar item already exists based on id
    const { data: existingItem, error: fetchError } = await supabase
      .from("radar_items")
      .select("*")
      .eq("id", radarItem.id)
      .single(); // Use single to fetch one row (if exists)

    console.log ("Projection -> exist or not", existingItem);
    //if (fetchError) {
    //  console.log("Error fetching radar item:", fetchError.message);
    //  throw new Error("Failed to check if radar item exists.");
    //}

    if (existingItem) {
      // If item exists, update it
      const { data, error } = await supabase
        .from("radar_items")
        .update({
          radar_id: radarItem.radar_id,
          name: radarItem.name,
          detect: radarItem.detect,
          assess: radarItem.assess,
          respond: radarItem.respond,
          type: radarItem.type,
          category: radarItem.category,
          distance: radarItem.distance,
          impact: radarItem.impact,
          tolerance: radarItem.tolerance,
          zoom_in: radarItem.zoom_in || null, // Optional field
          updated_at: new Date().toISOString(), // Update time
        })
        .eq("id", radarItem.id); // Match by id

      if (error) {
        console.log("Error updating radar item in Supabase:", error.message);
        throw new Error("Failed to update radar item in Supabase.");
      }

      console.log("Radar item successfully updated in Supabase:", data);
      return data;
    } else {
      // If item doesn't exist, insert a new one
      const { data, error } = await supabase
        .from("radar_items")
        .insert([
          {
            id: radarItem.id,
            radar_id: radarItem.radar_id,
            name: radarItem.name,
            detect: radarItem.detect,
            assess: radarItem.assess,
            respond: radarItem.respond,
            type: radarItem.type,
            category: radarItem.category,
            distance: radarItem.distance,
            impact: radarItem.impact,
            tolerance: radarItem.tolerance,
            zoom_in: radarItem.zoom_in || null, // Optional field
            created_at: new Date().toISOString(), // Set creation time
          },
        ]);

      if (error) {
        console.log("Error inserting radar item into Supabase:", error.message);
        throw new Error("Failed to insert radar item into Supabase.");
      }

      console.log("Radar item successfully inserted into Supabase:", data);
      return data;
    }
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
