// using write model
import { replayRadarItemState, saveRadarItemEvent, fetchAllRadarItems } from "../infrastructure/eventStoreRadarItems"; // Import event handling functions

/**
 * Retrieves the latest radar item state based on aggregate_id.
 * 
 * @param {string} aggregate_id - The unique identifier for the radar item.
 * @returns {object} - The latest radar item state.
 * @throws {Error} - Throws an error if the radar item cannot be retrieved.
 */
export async function getRadarItem(aggregate_id) {
  if (!aggregate_id) {
    throw new Error("Aggregate ID is required to get radar item.");
  }

  try {
    // Fetch and replay the state for the radar item using the aggregate_id
    const radarItemState = await replayRadarItemState(aggregate_id);

    if (!radarItemState) {
      throw new Error(`No radar item found for aggregate_id: ${aggregate_id}`);
    }
    console.log("Model -> the aggregate is", radarItemState);
    return radarItemState; // Return the reconstructed radar item state
  } catch (error) {
    console.error(`Error in getRadarItem for aggregate_id ${aggregate_id}:`, error.message);
    throw error; // Re-throw the error to be handled by the caller
  }
}


export async function handleRadarItemCreation(command) {
  console.log ("Model -> creating a new item", command);

  const { radar_id, name, description, type, category, impact, cost, zoom_in } = command.payload;

  // Validate inputs to ensure mandatory fields are provided
  if (!radar_id || !name || !type || !category || !impact || !cost) {
    console.log ("Model -< fields missing", radar_id);
    return { success: false, message: "Mandatory fields are missing" };
  }

  // Fetch events to check for duplicates in the given radar_id
  //const events = await fetchAllRadarItemsByRadarId();
  //const existingRadarItems = events
  //  .filter((event) => event.type === "CREATE_RADAR_ITEM" && event.payload.radar_id === radar_id)
  //  .map((event) => event.payload);

  // Check for duplicate radar item name within the radar
  //const duplicateItem = existingRadarItems.find((item) => item.name === name);
  //if (duplicateItem) {
  //  return { success: false, message: `Radar item with name "${name}" already exists for this radar.` };
  //}

  // Create radar item event
  const event = {
    type: "CREATE_RADAR_ITEM",
    payload: {
      radar_id,
      name,
      description,
      type,
      category,
      impact,
      cost,
      zoom_in: zoom_in || null, // Optional zoom_in
    },
  };

  console.log ("MODEL -> ready to save the item for this radar", radar_id );
  // Save the event to the event store
  try {
    await saveRadarItemEvent(event);
  } catch (error) {
    return { success: false, message: `Error saving event: ${error.message}` };
  }

  return { success: true, message: "Radar item created successfully", radarItem: event.payload };
}

export async function updateRadarItem(command) {
  console.log ("MODEL -> updating", command);
  const { radar_id, name, description, type, category, impact, cost, zoom_in } = command.payload;

  console.log ("MODEL 345-> updating aggregate id", command.aggregate_id);
  console.log ("MODEL 345 -> new name is", command.payload.name);
  // Validate inputs to ensure mandatory fields are provided
  if (!radar_id || !name || !type || !category || !impact || !cost) {
    return { success: false, message: "Mandatory fields are missing" };
  }

  // Create radar item updated event
  const event = {
    type: "RADAR_ITEM_UPDATED",
    payload: {
      radar_id : radar_id,
      aggregate_id : command.aggregate_id,
      name : name,
      description : description,
      type : type,
      category :category,
      impact : impact,
      cost: cost,
      zoom_in: zoom_in || null, // Optional zoom_in
    },
  };

  console.log ("Event I am ready to save..", event);

  // Save the event to the event store
  try {
    await saveRadarItemEvent(event);
  } catch (error) {
    return { success: false, message: `Error saving event: ${error.message}` };
  }

  return { success: true, message: "Radar item updated successfully", radarItem: event.payload };
}