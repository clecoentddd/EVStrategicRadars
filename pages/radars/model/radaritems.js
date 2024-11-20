import { saveRadarItemEvent, getRadarItemEvents } from "../infrastructure/eventStoreRadarItems"; // Import event handling functions

export async function handleRadarItemCreation(command) {
  const { radar_id, name, description, type, category, impact, cost, zoom_in } = command.payload;

  // Validate inputs to ensure mandatory fields are provided
  if (!radar_id || !name || !type || !category || !impact || !cost) {
    return { success: false, message: "Mandatory fields are missing" };
  }

  // Fetch events to check for duplicates in the given radar_id
  const events = await getRadarItemEvents();
  const existingRadarItems = events
    .filter((event) => event.type === "CREATE_RADAR_ITEM" && event.payload.radar_id === radar_id)
    .map((event) => event.payload);

  // Check for duplicate radar item name within the radar
  const duplicateItem = existingRadarItems.find((item) => item.name === name);
  if (duplicateItem) {
    return { success: false, message: `Radar item with name "${name}" already exists for this radar.` };
  }

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

  // Save the event to the event store
  try {
    await saveRadarItemEvent(event);
  } catch (error) {
    return { success: false, message: `Error saving event: ${error.message}` };
  }

  return { success: true, message: "Radar item created successfully", radarItem: event.payload };
}