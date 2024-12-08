import { supabase } from "../../../utils/supabaseClient"; // Supabase client library

/**
 * Project a strategic stream creation or update event into the Supabase "strategic_streams" table.
 * @param {Object} strategy - The strategic stream object containing relevant data.
 * @returns {Promise<Object>} - The result of the Supabase operation.
 */
export async function projectStrategiesToSupabase(strategy) {
  try {
    // Check if the strategic stream already exists
    console.log ("projectStrategiesToSupabase", strategy.event);
    const { data: existingItems, error: fetchError } = await supabase
      .from("strategic_strategies")
      .select("*")
      .eq("id", strategy.id);

    const existingItem = existingItems?.[0]; // Extract the first matching record

    if (fetchError) {
      console.error("Error fetching strategic stream:", fetchError.message);
      throw new Error("Failed to check if strategic stream exists.");
    }

    if (existingItem) {
      // Update the existing stream if it matches the event type
      if (strategy.event === "STRATEGY_CLOSED") {
        const { data, error } = await supabase
          .from("strategic_strategies")
          .update({
            id: strategy.id,
            state: strategy.state,
            updated_at: new Date().toISOString(),
          })
          .eq("id", strategy.id);

        if (error) {
          console.error("Error updating strategic stream:", error.message);
          throw new Error("Failed to update strategic stream in Supabase.");
        }

        return data;
      }
    } else {
      // Insert a new stream if it doesn't exist
      if (strategy.event === "STRATEGY_CREATED") {
        const { data, error } = await supabase
          .from("strategic_strategies")
          .insert([
            {
              id: strategy.id,
              event: strategy.event,
              type: strategy.type,
              stream_id: strategy.stream_id,
              previous_strategy_id: strategy.previous_strategy_id,
              name: strategy.name,
              description: strategy.description,
              state: strategy.state,
              updated_at: new Date().toISOString(),
            },
          ]);

        if (error) {
          console.error("Error inserting strategic stream:", error.message);
          throw new Error("Failed to insert strategic stream into Supabase.");
        }

        return data;
      }
    }
  } catch (err) {
    console.error("Unexpected error in projecting strategic stream:", err.message);
    throw err;
  }
}
