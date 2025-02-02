import { supabase } from "../../../utils/supabaseClient"; // Supabase client library

/**
 * Project a strategic strategy creation or update event into the Supabase "strategic_strategies" table.
 * @param {Object} strategy - The strategy object containing relevant data.
 * @returns {Promise<Object>} - The result of the Supabase operation.
 */
export async function projectStrategyToSupabase(strategy) {
  try {
    // Check if the strategic strategy already exists
    console.log("projectStrategiesToSupabase entering:", strategy.event);
    const { data: existingItems, error: fetchError } = await supabase
      .from("strategic_strategies")
      .select("*")
      .eq("id", strategy.id);

    const existingItem = existingItems?.[0]; // Extract the first matching record

    if (fetchError) {
      console.error("Error fetching strategic strategy:", fetchError.message);
      throw new Error("Failed to check if strategic strategy exists.");
    }

    if (existingItem) {
      // Update the existing strategy if it matches the event type
      if (strategy.event === "STRATEGY_CLOSED") {
        const { data, error } = await supabase
          .from("strategic_strategies")
          .update({
            id: strategy.id,
            state: strategy.state,
            updated_at: new Date().toISOString(),
          })
          .eq("id", strategy.id)
          .select("*"); // Request updated data to be returned

        if (error) {
          console.error("Error updating strategic strategy:", error.message);
          throw new Error("Failed to update strategic strategy in Supabase.");
        }

        console.log("Data (update) from Supabase:", data);
        return data; // Should now contain the updated row(s)
      } else if (strategy.event === "STRATEGY_UPDATED") {
        const { data, error } = await supabase
          .from("strategic_strategies")
          .update([
            {
              id: strategy.id,
              event: strategy.event,
              type: strategy.type,
              stream_id: strategy.stream_id,
              previous_strategy_id: strategy.previous_strategy_id,
              name: strategy.name,
              description: strategy.description,
              whatwewillnotdo: strategy.whatwewillnotdo,
              state: strategy.state,
              updated_at: new Date().toISOString(),
            },
          ])
          .eq("id", strategy.id) // Add a where clause to specify the row to update
          .select("*"); // Request inserted data to be returned

        if (error) {
          console.error("Error inserting strategic strategy:", error.message);
          throw new Error("Failed to insert strategic strategy into Supabase.");
        }

        console.log("Data (create) from Supabase:", data);
        return data; // Should now contain the inserted row(s)
      }
    } else {
      // Insert a new strategy if it doesn't exist
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
              whatwewillnotdo: strategy.whatwewillnotdo,
              state: strategy.state,
              updated_at: new Date().toISOString(),
            },
          ])
          .select("*"); // Request inserted data to be returned

        if (error) {
          console.error("Error inserting strategic strategy:", error.message);
          throw new Error("Failed to insert strategic strategy into Supabase.");
        }

        console.log("Data (create) from Supabase:", data);
        return data; // Should now contain the inserted row(s)
      }
    }
  } catch (err) {
    console.error("Unexpected error in projecting strategic strategy:", err.message);
    throw err;
  }
}
