import { supabase } from "../../../utils/supabaseClient"; // Supabase client library

/**
 * Project a strategic stream creation or update event into the Supabase "strategic_streams" table.
 * @param {Object} strategicStream - The strategic stream object containing relevant data.
 * @returns {Promise<Object>} - The result of the Supabase operation.
 */
export async function projectStreamToSupabase(strategicStream) {
  try {
    // Check if the strategic stream already exists
    console.log ("projectStrategicStreamToSupabase", strategicStream.event);
    const { data: existingItems, error: fetchError } = await supabase
      .from("strategic_streams")
      .select("*")
      .eq("id", strategicStream.id);

    const existingItem = existingItems?.[0]; // Extract the first matching record

    if (fetchError) {
      console.error("Error fetching strategic stream:", fetchError.message);
      throw new Error("Failed to check if strategic stream exists.");
    }

    if (existingItem) {
      // Update the existing stream if it matches the event type
      if (strategicStream.event === "STREAM_WITH_LATEST_STRATEGY_VERSION_UPDATED") {
        const { data, error } = await supabase
          .from("strategic_streams")
          .update({
            id: strategicStream.id,
            active_strategy_id: strategicStream.active_strategy_id,
            state: strategicStream.state,
            updated_at: new Date().toISOString(),
            event: strategicStream.event,
          })
          .eq("id", strategicStream.id);

        if (error) {
          console.error("Error updating strategic stream:", error.message);
          throw new Error("Failed to update strategic stream in Supabase.");
        }
        console.log("Data (update) from supabase", data);
        return data;
      }
    } else {
      // Insert a new stream if it doesn't exist
      if (strategicStream.event === "STREAM_CREATED") {
        const { data, error } = await supabase
          .from("strategic_streams")
          .insert([
            {
              id: strategicStream.id,
              name: strategicStream.name,
              description: strategicStream.description,
              radar_id: strategicStream.radar_id,
              active_strategy_id: strategicStream.active_strategy_id,
              state: strategicStream.state,
              updated_at: new Date().toISOString(),
              type: strategicStream.type,
              event: strategicStream.event,
            },
          ]);

        if (error) {
          console.error("Error inserting strategic stream:", error.message);
          throw new Error("Failed to insert strategic stream into Supabase.");
        }
        console.log("Data (create) from supabase", data);
        return data;
      }
    }
  } catch (err) {
    console.error("Unexpected error in projecting strategic stream:", err.message);
    throw err;
  }
}
