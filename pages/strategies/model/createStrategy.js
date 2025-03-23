import { sendStrategyCreated, replayStrategy } from '../infrastructure/eventStoreStrategies.js';

export async function createStrategy(command) {
    // Implement your strategy creation logic here
    console.log('createStrategy: Creating new version of strategy with payload:', command);
    // ... other logic to create the strategy

    // Validate inputs
    if (!command.stream_id || !command.name ) {
      return { success: false, message: "createStrategy: Missing required fields to create a new version" };
    }
    const newStrategy = {
      // ... other properties based on your needs
      type: "STRATEGY_NEW_VERSION_CREATED",
      stream_id: command.stream_id,
      name: command.name,
      description: command.description,
      whatwewillnotdo: command.whatwewillnotdo,
    };
    
    console.log ("createStrategy: Strategy about to create as new version with what we will not do: ", newStrategy);
  
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

  export async function GetStrategyById(stream_id, strategy_id) {
    // return aggregate based on id

    const strategyAggregate = await replayStrategy(stream_id, strategy_id);
    console.log (" the aggregate is", strategyAggregate);
    return strategyAggregate;
  }