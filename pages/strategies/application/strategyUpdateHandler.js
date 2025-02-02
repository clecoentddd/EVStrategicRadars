import { updateStrategy } from '../model/updateStrategy';
import { replayStream } from '../service/eventStoreStream';

export async function updateStrategyHandler(strategyId, streamId, body) {
    // Implement your strategy creation logic here
    console.log('updateStrategyHandler: Updating a draft or published version of strategy with payload:', strategyId);
    
    const command = {
        stream_id: streamId,
        id: strategyId,
        name: body.name,
        description: body.description,
        whatwewillnotdo: body.whatwewillnotdo,
        state: body.state
    }

    console.log ("updateStrategyHandler: command to be processed ", command);

    if (!command.stream_id || !command.id|| !command.name ) {
        return { success: false, message: "updateStrategyHandler: Missing required fields to create a new version" };
    }
    else 
    {
        if (replayStream(command.stream_id) === null) {
            return { success: false, message: "updateStrategyHandler: Strategy stream does not exist" };
        } else{ 
        console.log ("updateStrategyHandler: replay Stream done");
        const result = await updateStrategy(command);
        console.log ("updateStrategyHandler: Strategy created", result);
        return { result };
        }
    }
}