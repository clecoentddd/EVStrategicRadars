import { saveStrategyToEventSource } from '../infrastructure/eventStore';

export async function CreateStrategy(eventData) {
    // Implement your strategy creation logic here
    console.log('Strategy model: creating strategy with data:', eventData);
    console.log('Creating strategy with type:', eventData.type);
    console.log('Creating strategy with payload:', eventData.payload);
    // ... other logic to create the strategy

    if (eventData.type !== "CREATE_RADAR") {
      return { success: false, message: "Wrong event type received", eventData };
    }
  
    
    const { radar_id, name, description, level, status, aggregate_id, timestamp } = eventData.payload;
  
    // Validate inputs
    if (!aggregate_id || !name ) {
      return { success: false, message: "Missing required fields in event data" };
    }
  
    // Create the strategy item
    const newStrategy = {
      // ... other properties based on your needs
      radar_id: aggregate_id,
      name: name
    };

    console.log ("Strategy about to create", newStrategy);
  
    // Save the strategy item (replace with your actual saving logic)
  let savedStrategy;

    try {
      console.log ("Strategy... saving");
      savedStrategy = await saveStrategyToEventSource({ type: "CREATE_STRATEGY", payload: newStrategy });
      console.log ("Strategy... saved... it seems", savedStrategy);
      return { success: true, message: "Strategy created successfully", strategy };
    } catch (error) {
      return { success: false, message: `Error creating strategy: ${error.message}` };
    }
  }
