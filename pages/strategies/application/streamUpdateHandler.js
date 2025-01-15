import { updateStream} from '../model/updateStrategyStream';
import { getStreamByRadarId} from '../infrastructure/readModelStrategicElements';


export async function updateStreamHandler(command) {
    // Implement your strategy update logic here
    console.log('updateStreamHandler: Stream updating with radar data:', command.id);
   
    if (!command.id || !command.name ) {
        return { success: false, message: "updateStreamHandler: <Missing required fields in event data." + command.name };
        }
    else
    {
        // return stream with RadarId = command.id
        const streamToUpdate = await getStreamByRadarId(command.id);
        console.log ("updateStreamHandler: Stream to update based on radar id ", streamToUpdate);

        if (streamToUpdate.id === null || command.id !== streamToUpdate.radarId)
        {
            return { success: false, message: "updateStreamHandler: <Stream not found with radar id: " + command.id };
        }
        else {
            streamToUpdate.name = command.name;
            const result = await updateStream(streamToUpdate);
            console.log ("updateStreamHandler: Strategy stream updated", result);   
            return result
        }          
    }
}

