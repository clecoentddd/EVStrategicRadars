import { supabase } from "../../../utils/supabaseClient"; // Supabase client library

/**
 * Project a strategic element creation event into the Supabase "INITIATIVEs" table.
 * @param {Object} 
 * @returns {Promise<Object>} The result of the Supabase operation.
 */
export async function projectElementToSupabase(event) {
  try {
    // Check if the strategic element already exists
    const { data: existingItems, error: fetchError } = await supabase
      .from("strategic_initiatives")
      .select("*")
      .eq("id", event.aggregateId);

    const existingItem = existingItems?.[0]; // Extract the first matching record

    if (fetchError) {
      console.error("Error fetching strategic element:", fetchError.message);
      throw new Error("Failed to check if strategic element exists.");
    }

    if (existingItem) {
      if (event.eventType === "INITIATIVE_DELETED") {
        // Handle deletion
        const { data, error } = await supabase
          .from("strategic_initiatives")
          .update({
            eventType: event.eventType,
            state: event.payload.state,
            updated_at: new Date().toISOString(),
          })
          .eq("id", event.aggregateId)
          .select("*"); // Return the updated row(s)

        if (error) {
          console.error("Error updating strategic element:", error.message);
          throw new Error("Failed to update strategic element in Supabase.");
        }

        return data;
      } else if (event.eventType === "INITIATIVE_UPDATED") {
        // Handle update
        const { data, error } = await supabase
          .from("strategic_initiatives")
          .update({
            name: event.payload.name,
            description: event.payload.description,
            type: event.aggregateType,
            event: event.eventType,
            stream_id: event.payload.stream_id,
            strategy_id: event.payload.strategy_id,
            state: event.payload.state,
            updated_at: new Date().toISOString(),
            diagnosis: event.payload.diagnosis,
            overall_approach: event.payload.overall_approach,
            set_of_coherent_actions: event.payload.set_of_coherent_actions,
            proximate_objectives: event.payload.proximate_objectives,
            tags: event.payload.tags,
          })
          .eq("id", event.aggregateId)
          .select("*"); // Return the updated row(s)

        if (error) {
          console.error("Error updating strategic element:", error.message);
          throw new Error("Failed to update strategic element in Supabase.");
        }

        return data;
      }
    } else {
      // Handle insert using upsert to avoid race conditions
      const { data, error } = await supabase
        .from("strategic_initiatives")
        .upsert({
          id: event.aggregateId,
          name: event.payload.name,
          description: event.payload.description,
          type: event.aggregateType,
          event: event.eventType,
          stream_id: event.payload.stream_id,
          strategy_id: event.payload.strategy_id,
          state: event.payload.state,
          updated_at: new Date().toISOString(),
          diagnosis: event.payload.diagnosis,
          overall_approach: event.payload.overall_approach,
          set_of_coherent_actions: event.payload.set_of_coherent_actions,
          proximate_objectives: event.payload.proximate_objectives,
          tags: event.payload.tags,
        })
        .select("*"); // Return the inserted/updated row(s)

      if (error) {
        console.error("Error inserting strategic element:", error.message);
        throw new Error("Failed to insert strategic element into Supabase.");
      }

      return data;
    }
  } catch (err) {
    console.error("Unexpected error in projecting strategic element:", err.message);
    throw err;
  }
}
