import { supabase } from "../../../utils/supabaseClient";

/**
 * Projects strategy events to Supabase
 * - STRATEGY_CREATED: Inserts new row
 * - STRATEGY_UPDATED: Replaces entire row
 * @param {Object} event - Event with type, aggregateId and payload
 * @returns {Promise<Object>} - Resulting strategy record
 */
export async function projectStrategyToSupabase(event) {
  try {
    // Validate input
    if (!event || !event.eventType || !event.aggregateId || !event.payload) {
      throw new Error("Invalid event - missing required fields");
    }

    const { eventType, aggregateId, payload } = event;

    // Prepare common data
    const strategyRecord = {
      id: aggregateId,
      name: payload.name || '',
      description: payload.description || null,
      whatwewillnotdo: payload.whatwewillnotdo || null,
      state: payload.state || 'active',
      updated_at: new Date().toISOString(),
      ...(payload.stream_id && { stream_id: payload.stream_id }),
      ...(payload.previous_strategy_id && { previous_strategy_id: payload.previous_strategy_id }),
      ...(payload.version && { version: payload.version }),
    };

    // Handle different event types
    switch (eventType) {
      case 'STRATEGY_CREATED':
        strategyRecord.created_at = new Date().toISOString();
        strategyRecord.event = 'STRATEGY_CREATED';
        
        const { data: created, error: createError } = await supabase
          .from('projection_strategies')
          .insert(strategyRecord)
          .select()
          .single();

        if (createError) throw createError;
        return created;

      case 'STRATEGY_UPDATED':
        strategyRecord.event = 'STRATEGY_UPDATED';
        
        // First delete existing record (if any)
        await supabase
          .from('projection_strategies')
          .delete()
          .eq('id', aggregateId);

        // Then insert new version
        const { data: updated, error: updateError } = await supabase
          .from('projection_strategies')
          .insert(strategyRecord)
          .select()
          .single();

        if (updateError) throw updateError;
        return updated;

      default:
        throw new Error(`Unsupported event type: ${eventType}`);
    }

  } catch (error) {
    console.error('projectStrategyToSupabase failed:', {
      error: error.message,
      event: event
    });
    throw error;
  }
}