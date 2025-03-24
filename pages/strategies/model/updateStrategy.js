import { sendStrategyUpdated, replayStrategy } from '../infrastructure/eventStoreStrategies.js';

export async function updateStrategy(command) {
    // Implement your strategy creation logic here
    console.log('updateStrategy: Creating new version of strategy with payload:', command);
    // ... other logic to update the strategy

    // Validate inputs
    if (!command.stream_id || !command.id || !command.name ) {
      return { success: false, message: "updateStrategy: Missing required fields to create a new version" };
    }
    const updateStrategy = {
      // ... other properties based on your needs
      type: "STRATEGY_UPDATED",
      stream_id: command.stream_id,
      id: command.id,
      name: command.name,
      description: command.description,
      whatwewillnotdo: command.whatwewillnotdo,
      state: command.state
    };
    
    console.log ("updatetrategy: Strategy about to create as new version with what we will not do: ", updateStrategy);
  
    // Save the strategy item (replace with your actual saving logic)
  let savedStrategy;

    try {
      console.log ("Strategy... saving");
      savedStrategy = await sendStrategyUpdated( updateStrategy );
      console.log ("Strategy... saved... it seems", updateStrategy);
      return { ...savedStrategy };
    } catch (error) {
      return { success: false, message: `Error creating strategy: ${error.message}` };
    }
  }

  export async function GetStrategyById(stream_id, strategy_id) {
    // return aggregate based on id

    const strategyAggregate = await replayStrategy(strategy_id);
    console.log (" the aggregate is", strategyAggregate);
    return strategyAggregate;
  }