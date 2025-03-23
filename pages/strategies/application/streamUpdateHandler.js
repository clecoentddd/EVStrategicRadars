import { updateStream} from '../model/updateStrategyStream';
import { getStreamByRadarId} from '../infrastructure/readModelStreams';


export async function updateStreamHandler(command) {
    // Implement your strategy update logic here
    console.log('updateStreamHandler: Stream updating with radar data:', command);
   
    if (!command.aggregateId || !command.payload.name ) {
        return { success: false, message: "updateStreamHandler: <Missing required fields in event data." + command.name };
        }
    else
    {
        // return stream with RadarId = command.id
        const streamToUpdate = await getStreamByRadarId(command.aggregateId);
        console.log ("updateStreamHandler: Stream to update based on radar id ", streamToUpdate);

        if (streamToUpdate.aggreagateId === null)
        {
            return { success: false, message: "updateStreamHandler: <Stream not found with radar id: " + command.aggregateId };
        }
        else {
            streamToUpdate.name = command.payload.name;
            const result = await updateStream(streamToUpdate);
            console.log ("updateStreamHandler: Strategy stream updated", result);   
            return result
        }          
    }
}

