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

export async function getStreamByRadarId(id) { 
  try {
    const { data, error } = await supabase
      .from("strategic_streams")
      .select("*")
      .eq("radar_id", id)
      .single(); // Single ensures we get exactly one row or null

    if (error) {
      console.error("Error fetching steeam  based on radar_id:", error.message);
      throw new Error("Failed to fetch stream based on radar_id:", id);
    }

    return data;
  } catch (err) {
    console.error("Unexpected error fetching stream based on radar id:", err.message);
    throw err;
  }
}

export async function GetAllStreamData(stream_id) {
  try {
    // Step 1: Fetch all strategies where stream_id matches
    const { data: strategies, error: strategiesError } = await supabase
      .from("strategic_strategies")
      .select("*")
      .eq("stream_id", stream_id);

    if (strategiesError) {
      console.error("Error fetching strategies for stream_id:", strategiesError.message);
      throw new Error("Failed to fetch strategies for stream_id");
    }

    // If no strategies found, return early
    if (!strategies || strategies.length === 0) {
      return { strategies: [], elements: [] }; // No data to return
    }

    // Step 2: Fetch all elements with their corresponding strategy info
    const elementsWithStrategy = await Promise.all(
      strategies.map(async (strategy) => {
        const { data: elementData, error: elementError } = await supabase
          .from("strategic_elements")
          .select("*")
          .eq("strategy_id", strategy.id);

        if (elementError) {
          console.error("Error fetching elements for strategy:", strategy.id, elementError.message);
          // Handle or log the error (optional)
        }

        return { ...strategy, elements: elementData || [] }; // Include element data in each strategy object
      })
    );

    // Reorder data in the desired format
    const reorderedData = elementsWithStrategy.flatMap((item) => [
      item, 
      ...(item.elements || []) 
    ]);

    return { data: reorderedData }; // Return the reordered data as "data" property
  } catch (err) {
    console.error("Unexpected error fetching stream data:", err.message);
    throw err;
  }
}

