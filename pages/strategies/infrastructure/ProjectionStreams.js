import { supabase } from "../../../utils/supabaseClient"; // Supabase client library

/**
 * Project a strategic stream creation or update event into the Supabase "projection_strategic_streams" table.
 * @param {Object} event - The event object containing relevant data.
 * @returns {Promise<Object>} - The result of the Supabase operation.
 */
export async function projectStreamToSupabase(event) {
  try {
    console.log("projectStreamToSupabase: Processing event", event); // Log the full event object
    
    // Ensure eventType is defined
    if (!event.eventType) {
      console.error("projectStreamToSupabase: eventType is missing in the event object");
      throw new Error("eventType is required.");
    }

    console.log("projectStreamToSupabase: Processing eventType", event.eventType);

    // Handle different event types
    switch (event.eventType) {
      case "STREAM_CREATED":
        // Insert a new stream (no need to check if it exists, as this is a creation event)
        const { data: createdData, error: createError } = await supabase
          .from("projection_strategic_streams")
          .insert([
            {
              id: event.aggregateId,
              name: event.payload.name,
              radarId: event.payload.radarId,
              active_strategy_id: event.payload.active_strategy_id || null,
              state: event.payload.state || "Draft",
              updated_at: new Date().toISOString(),
            },
          ])
          .select("*"); // Request inserted data to be returned

        if (createError) {
          console.error("projectStreamToSupabase: Error creating strategic stream:", createError.message);
          throw new Error("Failed to create strategic stream.");
        }

        console.log("projectStreamToSupabase: Stream created successfully", createdData);
        return createdData;

      case "STREAM_NAME_UPDATED":
      case "STREAM_STRATEGY_UPDATED":
        // For update events, check if the stream exists first
        const { data: existingItems, error: fetchError } = await supabase
          .from("projection_strategic_streams")
          .select("*")
          .eq("id", event.aggregateId);

        if (fetchError) {
          console.error("projectStreamToSupabase: Error fetching strategic stream:", fetchError.message);
          throw new Error("Failed to check if strategic stream exists.");
        }

        const existingItem = existingItems?.[0]; // Extract the first matching record
        if (!existingItem) {
          console.error("projectStreamToSupabase: Stream not found. Cannot perform update.");
          throw new Error("Stream not found.");
        }

        // Perform the update based on the event type
        const updatePayload =
          event.eventType === "STREAM_NAME_UPDATED"
            ? { name: event.payload.name }
            : { active_strategy_id: event.payload.active_strategy_id };

        const { data: updatedData, error: updateError } = await supabase
          .from("projection_strategic_streams")
          .update({
            ...updatePayload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", event.aggregateId)
          .select("*"); // Request updated data to be returned

        if (updateError) {
          console.error(`projectStreamToSupabase: Error updating stream (${event.eventType}):`, updateError.message);
          throw new Error(`Failed to update stream (${event.eventType}).`);
        }

        console.log(`projectStreamToSupabase: Stream updated successfully (${event.eventType})`, updatedData);
        return updatedData;

      default:
        console.warn("projectStreamToSupabase: Unhandled event type:", event.eventType);
        throw new Error(`Unhandled event type: ${event.eventType}`);
    }
  } catch (err) {
    console.error("projectStreamToSupabase: Unexpected error:", err.message);
    throw err;
  }
}