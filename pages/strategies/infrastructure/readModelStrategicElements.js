import { supabase } from "../../../utils/supabaseClient"; // Import the Supabase client

/**
 * Fetch strategic elements by stream_id.
 * @param {string} streamId - The stream_id to filter strategic elements.
 * @returns {Promise<Object[]>} List of strategic elements with the specified stream_id.
 */
export async function getStrategicElementsByStreamId(streamId) {
  try {
    const { data, error } = await supabase
      .from("strategic_elements")
      .select("id, name, description, type, state, updated_at")
      .eq("stream_id", streamId);

    if (error) {
      console.error("Error fetching strategic elements by stream_id:", error.message);
      throw new Error("Failed to fetch strategic elements by stream_id.");
    }

    return data;
  } catch (err) {
    console.error("Unexpected error fetching strategic elements by stream_id:", err.message);
    throw err;
  }
}

/**
 * Fetch strategic elements by strategy_id.
 * @param {string} strategyId - The strategy_id to filter strategic elements.
 * @returns {Promise<Object[]>} List of strategic elements with the specified strategy_id.
 */
export async function getStrategicElementsByStrategyId(strategyId) {
  try {
    const { data, error } = await supabase
      .from("strategic_elements")
      .select("id, name, description, type, state, updated_at")
      .eq("strategy_id", strategyId);

    if (error) {
      console.error("Error fetching strategic elements by strategy_id:", error.message);
      throw new Error("Failed to fetch strategic elements by strategy_id.");
    }

    return data;
  } catch (err) {
    console.error("Unexpected error fetching strategic elements by strategy_id:", err.message);
    throw err;
  }
}

/**
 * Fetch a strategic element by its id.
 * @param {string} id - The unique id of the strategic element.
 * @returns {Promise<Object>} The strategic element matching the specified id.
 */
export async function getStrategicElementById(id) {
  try {
    const { data, error } = await supabase
      .from("strategic_elements")
      .select("*")
      .eq("id", id)
      .single(); // Single ensures we get exactly one row or null

    if (error) {
      console.error("Error fetching strategic element by id:", error.message);
      throw new Error("Failed to fetch strategic element by id.");
    }

    return data;
  } catch (err) {
    console.error("Unexpected error fetching strategic element by id:", err.message);
    throw err;
  }
}
