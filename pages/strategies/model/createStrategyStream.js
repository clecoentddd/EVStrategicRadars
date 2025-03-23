import { sendStreamCreated } from '../infrastructure/eventStoreStream.js';

export async function createStream(command) {
    // Implement your strategy creation logic here
    console.log('Strategy stream creating with radar data:', command);
       
    const streamToCreate = {
      radarId: command.aggregateId,
      name: command.payload.name,
      level: command.payload.level,
      active_strategy_id: null,
    }

    console.log ("Strategy stream... Stream to create based on radar id ", streamToCreate);
  
    // Validate inputs
    if (! streamToCreate.radarId || !streamToCreate.name ) {
      return { success: false, message: "Missing required fields in event data" };
    }
  
  console.log ("Strategy stream about to create", streamToCreate);
  
    // Save the strategy item (replace with your actual saving logic)
  let savedStrategyStream;

    try {
      console.log ("Strategy stream... saving");
      savedStrategyStream = await sendStreamCreated( streamToCreate);
      console.log ("Model createStream saved", savedStrategyStream);
      return { ...savedStrategyStream };
    } catch (error) {
      return { success: false, message: `Error creating strategy stream : ${error.message}` };
    }
  }

