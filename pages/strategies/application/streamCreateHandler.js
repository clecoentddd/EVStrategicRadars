import { createStream } from '../model/createStrategyStream';

export async function createStreamHandler(command) {
    // Implement your strategy creation logic here
    console.log('createStreamHandler: Strategy Creating with radar data:', command.aggregateId);
    console.log('createStreamHandler: Strategy Creating with radar data:', command.payload.name);
    
    if (!command.aggregateId || !command.payload.name ) {
        return { success: false, message: "createStreamHandler: <Missing required fields in event data." + command.name };
        }
    else
    {
       const result = await createStream(command)

       console.log ("createStreamHandler: Strategy stream created", result);  
       return { result };     
    }
}


