import { supabase } from "../../../utils/supabaseClient"; // Import the Supabase client

/**
 * Fetch strategic elements by stream_id.
 * @param {string} streamId - The stream_id to filter strategic elements.
 * @returns {Promise<Object[]>} List of strategic elements with the specified stream_id.
 */
export async function getByStreamId(streamId) {
  try {
    const { data, error } = await supabase
      .from("projection_initiatives")
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
export async function getByStrategyId(strategyId) {
  try {
    const { data, error } = await supabase
      .from("projection_initiatives")
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
export async function getById(id) {
  try {
    const { data, error } = await supabase
      .from("projection_initiatives")
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

export async function getStreamDataFromStreamId(id) {
  try {
    const { data, error } = await supabase
      .from("projection_strategic_streams")
      .select("*")
      .eq("id", id)
      .single(); // Single ensures we get exactly one row or null

    if (error) {
      console.error("Error fetching strategic stream by id:", error.message);
      throw new Error("Failed to fetch strategic stream by id.");
    }

    return data;
  } catch (err) {
    console.error("Unexpected error fetching strategic stream by id:", err.message);
    throw err;
  }
}

export async function getStreamByOrganisationId(organisationId) { 
  console.log("getStreamByOrganisationId : getting stream for radarId = ", organisationId);
  try {
    const { data, error } = await supabase
      .from("projection_strategic_streams")
      .select("*")
      .eq("organisationId", organisationId)
      .single(); // Single ensures we get exactly one row or null

    if (error) {
      console.error("Error fetching stream  based on aggregateId:", error.message);
      throw new Error("Failed to fetch stream based on aggregateId:", organisationId);
    }
    console.error("getStreamByOrganisationId stream is: ", data);
    return data;
  } catch (err) {
    console.error("Unexpected error fetching stream based on radar id:", err.message);
    throw err;
  }
}

export async function getAllStreamData(stream_id) {
  console.log ("getAllStreamData for stream id = ",stream_id);
  try {
    // Step 1: Fetch all strategies where stream_id matches
    const { data: strategies, error: strategiesError } = await supabase
      .from("projection_strategies")
      .select("*")
      .eq("stream_id", stream_id);

    if (strategiesError) {
      console.error("Error fetching strategies for stream_id:", strategiesError.message);
      throw new Error("Failed to fetch strategies for stream_id");
    }

    // If no strategies found, return early
    if (!strategies || strategies.length === 0) {
      return []; // Return empty array if no strategies exist
    }

    // Step 2: Attach elements to each strategy
    const strategiesWithElements = await Promise.all(
      strategies.map(async (strategy) => {
        // Fetch elements for the current strategy
        const { data: elements, error: elementsError } = await supabase
          .from("projection_initiatives")
          .select("*")
          .eq("strategy_id", strategy.id);

        if (elementsError) {
          console.error(
            "Error fetching elements for strategy:",
            strategy.id,
            elementsError.message
          );
          // Proceed without elements if there's an error
          return { ...strategy, elements: [] };
        }

        // Attach elements to the strategy
        return { ...strategy, elements: elements || [] };
      })
    );
    return strategiesWithElements; // Return structured data
  } catch (err) {
    console.error("Unexpected error fetching stream data:", err.message);
    throw err;
  }
}


export async function getAllStreamData1(stream_id) {
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

    console.log("Fetched strategies:", strategies);

    // If no strategies found, return early
    if (!strategies || strategies.length === 0) {
      return { strategies: [], elements: [] }; // No data to return
    }

    // Reorder data in the desired format
    const reorderedData = [];
    for (const strategy of strategies) {
      reorderedData.push(strategy); // Push strategy information

      // Fetch elements for the current strategy
      const { data: elements, error: elementsError } = await supabase
        .from("projection_initiatives")
        .select("*")
        .eq("strategy_id", strategy.id);

      if (elementsError) {
        console.error("Error fetching elements for strategy:", strategy.id, elementsError.message);
        // Handle or log the error (optional)
      }

      if (elements && elements.length > 0) {
        reorderedData.push(...elements); // Push elements if they exist
      }
    }

    return { data: reorderedData }; // Return the reordered data as "data" property
  } catch (err) {
    console.error("Unexpected error fetching stream data:", err.message);
    throw err;
  }
}

