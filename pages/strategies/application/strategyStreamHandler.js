import { createStream } from '../model/strategy';
import { createStrategy } from '../model/strategy';

export async function createStreamHandler(command) {
    // Implement your strategy creation logic here
    console.log('createStreamHandler: Strategy Creating with radar data:', command.id);
    
    if (!command.id || !command.name ) {
        return { success: false, message: "createStreamHandler: <Missing required fields in event data." + command.name };
        }
    else
    {
       const result = await createStream(command)

       console.log ("createStreamHandler: Strategy stream created", result);  
       return { result };     
    }
}

export async function createStrategyHandler(command) {
    // Implement your strategy creation logic here
    console.log('createStrategyHandler: Creating new version of strategy with payload:', command);
    
    if (!command.stream_id || !command.name ) {
        return { success: false, message: "createStrategyHandler: Missing required fields to create a new version" };
    }
    else
    {
        if (replayStream(command.stream_id, command.strategy_id)) {
            return { success: false, message: "createStrategyHandler: Strategy stream does not exist" };
        } else{ 
        const result = await createStrategy(command);
        console.log ("createStrategyHandler: Strategy created", result);
        return { result };
        }
    }
}
