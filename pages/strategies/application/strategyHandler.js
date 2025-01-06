import { replayStream } from '../infrastructure/eventStoreStream.js';
import { createStrategy } from '../model/strategyStrategies.js';

export async function createStrategyHandler(command) {
    // Implement your strategy creation logic here
    console.log('createStrategyHandler: Creating new version of strategy with payload:', command);
    
    if (!command.stream_id || !command.name ) {
        console.log('createStrategyHandler: stream id should exist:', command.stream_id);
        return { success: false, message: "createStrategyHandler: Missing required fields to create a new version" };
    }
    else
    {
        console.log("Replay stream before creating a new strategy:", command);
        if (replayStream(command.stream_id) === null) {
            return { success: false, message: "createStrategyHandler: Strategy stream does not exist" };
        } else{ 
        const result = await createStrategy(command);
        console.log ("createStrategyHandler: Strategy created", result);
        return { result };
        }
    }
}
