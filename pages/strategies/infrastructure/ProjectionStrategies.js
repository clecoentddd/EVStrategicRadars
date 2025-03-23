import { supabase } from "../../../utils/supabaseClient"; // Supabase client library

/**
 * Project a strategic strategy creation or update event into the Supabase "strategic_strategies" table.
 * @param {Object} event - The event object containing relevant data.
 * @returns {Promise<Object>} - The result of the Supabase operation.
 */
export async function projectStrategyToSupabase(event) {
  try {
    console.log("projectStrategyToSupabase: Processing event", event);

    const { eventType, payload } = event;

    // Check if the strategic strategy already exists
    const { data: existingItems, error: fetchError } = await supabase
      .from("strategic_strategies")
      .select("*")
      .eq("id", payload.id);

    if (fetchError) {
      console.error("projectStrategyToSupabase: Error fetching strategic strategy:", fetchError.message);
      throw new Error("Failed to check if strategic strategy exists.");
    }

    const existingItem = existingItems?.[0]; // Extract the first matching record
    console.log("projectStrategyToSupabase: Existing item", existingItem);

    // Handle different event types
    switch (eventType) {
      case "STRATEGY_CREATED":
        if (existingItem) {
          console.warn("projectStrategyToSupabase: Strategy already exists. Skipping creation.");
          return existingItem;
        }

        // Insert a new strategy
        const { data: createdData, error: createError } = await supabase
          .from("strategic_strategies")
          .insert([
            {
              id: payload.id,
              event: eventType,
              stream_id: event.payload.stream_id,
              previous_strategy_id: payload.previous_strategy_id,
              version: payload.version,
              name: payload.name,
              description: payload.description,
              whatwewillnotdo: payload.whatwewillnotdo,
              state: payload.state,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select("*"); // Request inserted data to be returned

        if (createError) {
          console.error("projectStrategyToSupabase: Error creating strategic strategy:", createError.message);
          throw new Error("Failed to create strategic strategy.");
        }

        console.log("projectStrategyToSupabase: Strategy created successfully", createdData);
        return createdData;

      case "STRATEGY_UPDATED":
        if (!existingItem) {
          console.error("projectStrategyToSupabase: Strategy not found. Cannot update.");
          throw new Error("Strategy not found.");
        }

        // Update the existing strategy
        const { data: updatedData, error: updateError } = await supabase
          .from("strategic_strategies")
          .update({
            name: payload.name,
            description: payload.description,
            whatwewillnotdo: payload.whatwewillnotdo,
            state: payload.state,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payload.id)
          .select("*"); // Request updated data to be returned

        if (updateError) {
          console.error("projectStrategyToSupabase: Error updating strategic strategy:", updateError.message);
          throw new Error("Failed to update strategic strategy.");
        }

        console.log("projectStrategyToSupabase: Strategy updated successfully", updatedData);
        return updatedData;

      case "STRATEGY_CLOSED":
        if (!existingItem) {
          console.error("projectStrategyToSupabase: Strategy not found. Cannot close.");
          throw new Error("Strategy not found.");
        }

        // Close the existing strategy
        const { data: closedData, error: closeError } = await supabase
          .from("strategic_strategies")
          .update({
            state: payload.state,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payload.id)
          .select("*"); // Request updated data to be returned

        if (closeError) {
          console.error("projectStrategyToSupabase: Error closing strategic strategy:", closeError.message);
          throw new Error("Failed to close strategic strategy.");
        }

        console.log("projectStrategyToSupabase: Strategy closed successfully", closedData);
        return closedData;

      default:
        console.warn("projectStrategyToSupabase: Unhandled event type:", eventType);
        throw new Error(`Unhandled event type: ${eventType}`);
    }
  } catch (err) {
    console.error("projectStrategyToSupabase: Unexpected error:", err.message);
    throw err;
  }
}