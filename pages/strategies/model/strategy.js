import { sendStreamCreated, sendStrategyCreated, replayStrategy } from '../infrastructure/eventStoreStream';

export async function CreateStream(command) {
    // Implement your strategy creation logic here
    console.log('Strategy stream creating with radar data:', command);
    
       
    const { radar_id, name, description } = command;
  
    // Validate inputs
    if (!radar_id || !name ) {
      return { success: false, message: "Missing required fields in event data" };
    }
  
    // Create the strategy item
    const newStrategyStream = {
      // ... other properties based on your needs
      radar_id: radar_id,
      name: name,
      description: description,
      active_strategy_id: null,
    };

    console.log ("Strategy stream about to create", newStrategyStream);
  
    // Save the strategy item (replace with your actual saving logic)
  let savedStrategyStream;

    try {
      console.log ("Strategy stream... saving");
      savedStrategyStream = await sendStreamCreated( newStrategyStream);
      console.log ("Model CreateStream saved", savedStrategyStream);
      return { ...savedStrategyStream };
    } catch (error) {
      return { success: false, message: `Error creating strategy stream : ${error.message}` };
    }
  }

  

export async function CreateNewStrategy(command) {
    // Implement your strategy creation logic here
    console.log('Creating new version of strategy with payload:', command);
    // ... other logic to create the strategy

    // Validate inputs
    if (!command.stream_id || !command.name ) {
      return { success: false, message: "Missing required fields to create a new version" };
    }
    const newStrategy = {
      // ... other properties based on your needs
      type: "STRATEGY_NEW_VERSION_CREATED",
      stream_id: command.stream_id,
      name: command.name,
      description: command.description,
    };
  
    
    console.log ("Strategy about to create as new version", newStrategy);
  
    // Save the strategy item (replace with your actual saving logic)
  let savedStrategy;

    try {
      console.log ("Strategy... saving");
      savedStrategy = await sendStrategyCreated( newStrategy );
      console.log ("Strategy... saved... it seems", savedStrategy);
      return { ...savedStrategy };
    } catch (error) {
      return { success: false, message: `Error creating strategy: ${error.message}` };
    }
  }

  export async function GetStrategyById(strategy_id) {
    // return aggregate based on id

    const strategyAggregate = await replayStrategy(strategy_id);
    console.log (" the aggregate is", strategyAggregate);
    return strategyAggregate;
  }