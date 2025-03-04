import { sendStreamCreated } from '../infrastructure/eventStoreStream.js';

export async function createStreamFromNewOrganisation(organisationAggregate) {
    // Implement your strategy creation logic here
    console.log('Strategy stream creating with radar data:', organisationAggregate);
       
    const streamToCreate = {
      organisationId: organisationAggregate.aggregateId,
      organisationName: organisationAggregate.payload.name,
      organisationLevel: organisationAggregate.payload.level,
      active_strategy_id: null,
    }

    console.log ("Strategy stream... Stream to create based on radar id ", streamToCreate);
  
    // Validate inputs
    if (! streamToCreate.organisationId || !streamToCreate.organisationName ) {
      return { success: false, message: "Missing required fields in event data" };
    }
  
  console.log ("Strategy stream about to create", streamToCreate);
  
    // Save the strategy item (replace with your actual saving logic)
  let savedStrategyStream;

    try {
      console.log ("Strategy stream... saving");
      savedStrategyStream = await sendStreamCreated( streamToCreate);
      console.log ("Model createStreamFromNewOrganisation saved", savedStrategyStream);
      return { ...savedStrategyStream };
    } catch (error) {
      return { success: false, message: `Error creating strategy stream : ${error.message}` };
    }
  }

