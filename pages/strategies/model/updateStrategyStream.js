import { sendStreamUpdated } from '../service/eventStoreStream.js';

export async function updateStream(command) {
    // Implement your strategy creation logic here
    console.log('Strategy stream updating with radar data:', command);
    
        // Dynamically construct the streamToUpdate object

       if (!command.name) {
        return { success: false, message: "updateStream: Missing required - name - fields in event data" };
       }    
        
      const streamToUpdate = {
                radarId: command.radarId,
                id: command.id,
                name: command.name,
              }
        

    console.log ("Strategy stream... Stream to update based on radar id ", streamToUpdate);
  
    // Validate inputs
    if (! streamToUpdate.radarId || !streamToUpdate.name ) {
      return { success: false, message: "updateStream: Missing required - name - fields in event data" };
    }
  
  console.log ("Strategy stream about to update", streamToUpdate);
  
    // Save the strategy item (replace with your actual saving logic)
  let savedStrategyStream;

    try {
      console.log ("Strategy stream... saving");
      savedStrategyStream = await sendStreamUpdated(streamToUpdate);
      console.log ("Model createStream saved", savedStrategyStream);
      return { ...savedStrategyStream };
    } catch (error) {
      return { success: false, message: `Error creating strategy stream : ${error.message}` };
    }
  }

