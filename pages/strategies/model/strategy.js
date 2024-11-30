import { saveToEventSource } from '../infrastructure/eventStore';

export async function CreateStrategyStream(command) {
    // Implement your strategy creation logic here
    console.log('Strategy stream creating with radar data:', command);
    
       
    const { radar_id, name, description, level, status, timestamp } = command;
  
    // Validate inputs
    if (!aggregate_id || !name ) {
      return { success: false, message: "Missing required fields in event data" };
    }
  
    // Create the strategy item
    const newStrategyStream = {
      // ... other properties based on your needs
      radar_id: aggregate_id,
      name: name,
      description: description,
      type: "STRATEGY_STREAM_CREATED"
    };

    console.log ("Strategy stream about to create", newStrategyStream);
  
    // Save the strategy item (replace with your actual saving logic)
  let savedStrategyStream;

    try {
      console.log ("Strategy stream... saving");
      savedStrategyStream = await saveToEventSource( newStrategyStream);
      console.log ("Strategy stream ... saved... it seems", savedStrategyStream);
      return { success: true, message: "Strategy stream created successfully", savedStrategyStream };
    } catch (error) {
      return { success: false, message: `Error creating strategy stream : ${error.message}` };
    }
  }

  

export async function CreateNewVersionOfStrategy(command) {
    // Implement your strategy creation logic here
    console.log('Creating new version of strategy with payload:', command);
    // ... other logic to create the strategy

    // Validate inputs
    if (!command.stream_id || !command.aggregate_id || !command.name ) {
      return { success: false, message: "Missing required fields to create a new version" };
    }
    const newStrategy = {
      // ... other properties based on your needs
      type: "STRATEGY_NEW_VERSION_CREATED",
      stream: strategy_id,
      aggregate_id: command.aggregate_id,
      title: command.name,
      description: command.description,
    };
  
    
    console.log ("Strategy about to create as new version", newStrategy);
  
    // Save the strategy item (replace with your actual saving logic)
  let savedStrategy;

    try {
      console.log ("Strategy... saving");
      savedStrategy = await saveToEventSource( newStrategy );
      console.log ("Strategy... saved... it seems", savedStrategy);
      return { success: true, message: "Strategy created successfully", savedStrategy };
    } catch (error) {
      return { success: false, message: `Error creating strategy: ${error.message}` };
    }
  }

