import { supabase } from "../../../utils/supabaseClient"; // Supabase client library

/**
 * Project a strategic element creation event into the Supabase "strategic_elements" table.
 * @param {Object} strategicElement
 * @returns {Promise<Object>} The result of the Supabase operation.
 */
export async function projectElementToSupabase(strategicElement) {
  try {
    // Check if the strategic element already exists
    const { data: existingItems, error: fetchError } = await supabase
      .from("strategic_elements")
      .select("*")
      .eq("id", strategicElement.id);

    const existingItem = existingItems?.[0]; // Extract the first matching record

    if (fetchError) {
      console.error("Error fetching strategic element:", fetchError.message);
      throw new Error("Failed to check if strategic element exists.");
    }

    if (existingItem) {
      if (strategicElement.event === "STRATEGIC_ELEMENT_DELETED") {
        // Handle deletion
        const { data, error } = await supabase
          .from("strategic_elements")
          .update({
            event: strategicElement.event,
            state: strategicElement.state,
            updated_at: new Date().toISOString(),
          })
          .eq("id", strategicElement.id)
          .select("*"); // Return the updated row(s)

        if (error) {
          console.error("Error updating strategic element:", error.message);
          throw new Error("Failed to update strategic element in Supabase.");
        }

        return data;
      } else if (strategicElement.event === "STRATEGIC_ELEMENT_UPDATED") {
        // Handle update
        const { data, error } = await supabase
          .from("strategic_elements")
          .update({
            name: strategicElement.name,
            description: strategicElement.description,
            type: strategicElement.type,
            event: strategicElement.event,
            stream_id: strategicElement.stream_id,
            strategy_id: strategicElement.strategy_id,
            state: strategicElement.state,
            updated_at: new Date().toISOString(),
            diagnosis: strategicElement.diagnosis,
            overall_approach: strategicElement.overall_approach,
            set_of_coherent_actions: strategicElement.set_of_coherent_actions,
            proximate_objectives: strategicElement.proximate_objectives,
            tags: strategicElement.tags,
          })
          .eq("id", strategicElement.id)
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
        .from("strategic_elements")
        .upsert({
          id: strategicElement.id,
          name: strategicElement.name,
          description: strategicElement.description,
          type: strategicElement.type,
          event: strategicElement.event,
          stream_id: strategicElement.stream_id,
          strategy_id: strategicElement.strategy_id,
          state: strategicElement.state,
          updated_at: new Date().toISOString(),
          diagnosis: strategicElement.diagnosis,
          overall_approach: strategicElement.overall_approach,
          set_of_coherent_actions: strategicElement.set_of_coherent_actions,
          proximate_objectives: strategicElement.proximate_objectives,
          tags: strategicElement.tags,
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
