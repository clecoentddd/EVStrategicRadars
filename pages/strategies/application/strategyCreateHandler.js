import { createStrategy } from '../model/createStrategy';
import { replayStream } from '../infrastructure/eventStoreStream';

export async function createStrategyHandler(command) {
    // Implement your strategy creation logic here
    console.log('createStrategyHandler: Creating new version of strategy with payload:', command);
    
    if (!command.stream_id || !command.name ) {
        return { success: false, message: "createStrategyHandler: Missing required fields to create a new version" };
    }
    else
    {
        if (replayStream(command.stream_id) === null) {
            return { success: false, message: "createStrategyHandler: Strategy stream does not exist" };
        } else{ 
        console.log ("createStrategyHandler: replay Stream done");
        const result = await createStrategy(command);
        console.log ("createStrategyHandler: Strategy created", result);
        return { result };
        }
    }
}