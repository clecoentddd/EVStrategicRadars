import { v4 as uuidv4 } from 'uuid'; // Import the UUID generator
import { saveRadarItemEvent, getRadarItemEvents } from "../infrastructure/eventStoreRadarItems"; // Import event handling functions

export async function handleRadarItemCreation(command) {
  const { radar_id, name, description, type, category, impact, cost, zoom_id } = command.payload;

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

  // Generate a unique radar item ID
  const radarItemId = uuidv4(); // Generate a new UUID for the radar item

  // Create radar item event
  const event = {
    type: "CREATE_RADAR_ITEM",
    payload: {
      radar_item_id: radarItemId, // Store the unique radar item ID
      radar_id,
      name,
      description,
      type,
      category,
      impact,
      cost,
      zoom_id: zoom_id || null, // Optional zoom_id
    },
  };

  // Save the event to the event store
  await saveRadarItemEvent(event);

  return { success: true, message: "Radar item created successfully", radarItem: event.payload };
}