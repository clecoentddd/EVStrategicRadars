// using write model
import { replayRadarItemState, saveRadarItemEvent, fetchAllRadarItems } from "../infrastructure/eventStoreRadarItems"; // Import event handling functions

/**
 * Retrieves the latest radar item state based on id.
 * 
 * @param {string} id - The unique identifier for the radar item.
 * @returns {object} - The latest radar item state.
 * @throws {Error} - Throws an error if the radar item cannot be retrieved.
 */
export async function getRadarItem(radar_id, id) {
  if (!id) {
    throw new Error("Aggregate ID is required to get radar item.");
  }

  try {
    // Fetch and replay the state for the radar item using the id
    const radarItemState = await replayRadarItemState(radar_id, id);

    if (!radarItemState) {
      throw new Error(`No radar item found for id: ${id}`);
    }
    console.log("Model -> the aggregate is", radarItemState);
    return radarItemState; // Return the reconstructed radar item state
  } catch (error) {
    console.error(`Error in getRadarItem for id ${id}:`, error.message);
    throw error; // Re-throw the error to be handled by the caller
  }
}


export async function handleRadarItemCreation(command) {
  console.log ("Model -> creating a new item", command);

  const { radar_id, name, detect, assess, respond, type, category, distance, impact, tolerance, zoom_in } = command;

  console.log("Getting here with radar id", radar_id);
  // Validate inputs to ensure mandatory fields are provided
  if (!radar_id || !name || !type || !category || !distance|| !impact || !tolerance) {
    console.log ("Model -> fields missing", radar_id, tolerance, type, name, distance, impact);
    return { success: false, message: "Mandatory fields are missing" };
  }

  // Fetch events to check for duplicates in the given radar_id
  //const events = await fetchAllRadarItemsByRadarId();
  //const existingRadarItems = events
  //  .filter((event) => event.type === "RADAR_ITEM_CREATED" && event.payload.radar_id === radar_id)
  //  .map((event) => event.payload);

  // Check for duplicate radar item name within the radar
  //const duplicateItem = existingRadarItems.find((item) => item.name === name);
  //if (duplicateItem) {
  //  return { success: false, message: `Radar item with name "${name}" already exists for this radar.` };
  //}

  // Create radar item event
  const eventToCreate = {
    event: "RADAR_ITEM_CREATED",
    payload: {
      aggregate_type: "RADAR_ITEM",
      radar_id: radar_id,
      name: name,
      detect: detect,
      assess: assess,
      respond: respond,
      type: type,
      category: category,
      distance: distance,
      impact: impact,
      tolerance: tolerance,
      zoom_in: zoom_in || null, // Optional zoom_in
      timestamp: null,
    },
  };

  console.log ("MODEL -> ready to save the item for this radar with event and type", eventToCreate );
  // Save the event to the event store
  try {
    const eventCreated = await saveRadarItemEvent(eventToCreate);
    return { success: true, message: "Radar item created successfully", ...eventCreated };
  } catch (error) {
    return { success: false, message: `Error saving event: ${error.message}` };
  }

}

export async function updateRadarItem(command) {
  console.log ("MODEL -> updating", command);
  const { id, radar_id, name, detect, assess, respond, type, category, distance,impact, tolerance, zoom_in } = command;

  console.log ("MODEL 345-> updating radar item id", command.id);
  console.log ("MODEL 345 -> new name is", command.name);
  // Validate inputs to ensure mandatory fields are provided
  if (!id || !radar_id || !name || !type || !category || !distance|| !impact || !tolerance) {
    return { success: false, message: "Mandatory fields are missing" };
  }
 
  // Create radar item updated event
  const event = {
    event: "RADAR_ITEM_UPDATED",
    payload: {
      aggregate_type: "RADAR_ITEM",
      id : id,
      radar_id : radar_id,
      name : name,
      detect: detect,
      assess: assess,
      respond: respond,
      type : type,
      category :category,
      distance: distance,
      impact : impact,
      tolerance: tolerance,
      zoom_in: zoom_in || null, // Optional zoom_in
      timestamp: null,
    },
  };

  console.log ("Event I am ready to save..", event);

  // Save the event to the event store
  try {
    const itemUpdated = await saveRadarItemEvent(event);
    return { success: true, message: "Radar item updated successfully", ...itemUpdated };
  } catch (error) {
    return { success: false, message: `Error saving event: ${error.message}` };
  }
}