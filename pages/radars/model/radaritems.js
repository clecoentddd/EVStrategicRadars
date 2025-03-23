// using write model
import { sendRadarItemSaveEvent } from "../infrastructure/eventStoreSaveRadarItem"; 
import { replayRadarItemState } from "../infrastructure/eventStoreReplayRadarItem"; // Import event handling functions
import { v4 as uuidv4 } from 'uuid';
// Import event handling functions

/**
 * Retrieves the latest radar item state based on id.
 * 
 * @param {string} id - The unique identifier for the radar item.
 * @returns {object} - The latest radar item state.
 * @throws {Error} - Throws an error if the radar item cannot be retrieved.
 */
export async function getRadarItem(radarItemId) {
  console.log("getRadarItem -radar Item Id is: ", radarItemId);
  if (!radarItemId) {
    throw new Error("Aggregate ID is required to get radar item.");
  }

  try {
    // Fetch and replay the state for the radar item using the id
    console.log("getRadarItem -start replay");
    const radarItemState = await replayRadarItemState(radarItemId);

    if (!radarItemState) {
      throw new Error(`No radar item found for id: ${radarItemId}`);
    }
    console.log("Model -> the aggregate is", radarItemState);
    return radarItemState; // Return the reconstructed radar item state
  } catch (error) {
    console.error(`Error in getRadarItem for id ${radarItemId}:`, error.message);
    throw error; // Re-throw the error to be handled by the caller
  }
}


export async function handleRadarItemCreate(command) {
  console.log ("Model -> creating a new item", command);

  const { radarId, name, detect, assess, respond, type, category, distance, impact, tolerance, zoom_in } = command;

  console.log("Getting here with radar id", radarId);
  // Validate inputs to ensure mandatory fields are provided
  if (!radarId || !name || !type || !category || !distance|| !impact || !tolerance) {
    console.log ("Model -> fields missing", radarId, tolerance, type, name, distance, impact);
    return { success: false, message: "Mandatory fields are missing" };
  }

   // Create radar item event
  const eventToCreate = {
    eventType: "RADAR_ITEM_CREATED",
    aggregateId:  uuidv4(),
    aggregateType: "RADAR_ITEM",
    created_at: new Date().toISOString(),
    payload: {
      radarId: radarId,
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
    const eventCreated = await sendRadarItemSaveEvent(eventToCreate);
    return { success: true, message: "Radar item created successfully", ...eventCreated };
  } catch (error) {
    return { success: false, message: `Error saving event: ${error.message}` };
  }

}

export async function handleRadarItemUpdate(command) {
  console.log ("handleRadarItemUpdate: entering with command: ", command);
  const { id, radarId, name, detect, assess, respond, type, category, distance,impact, tolerance, zoom_in } = command;

  // Validate inputs to ensure mandatory fields are provided
  if (!id || !radarId || !name || !type || !category || !distance|| !impact || !tolerance) {
    return { success: false, message: "Mandatory fields are missing" };
  }
 
  const eventToUpdate = {
    eventType: "RADAR_ITEM_UPDATED",
    aggregateId:  id,
    aggregateType: "RADAR_ITEM",
    created_at: new Date().toISOString(),
    payload: {
      radarId: radarId,
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

  console.log ("handleRadarItemUpdate: Event I am ready to save..", eventToUpdate);

  // Save the event to the event store
  try {
    const itemUpdated = await sendRadarItemSaveEvent(eventToUpdate);
    console.log ("handleRadarItemUpdate: Event I have saved..", itemUpdated);
    return { success: true, message: "Radar item updated successfully", ...itemUpdated };
  } catch (error) {
    return { success: false, message: `Update radar item: Error saving event: ${error.message}` };
  }
}