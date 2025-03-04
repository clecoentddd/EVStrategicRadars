import { sendStreamUpdated } from '../infrastructure/eventStoreStream.js';

export async function updateStreamFromChangeInOrganisation(streamAggregate, organisationAggregate) {
    // Implement your strategy creation logic here
    console.log('updateStreamFromChangeInOrganisation: Stream to update with organisation data:', streamAggregate);
    
        // Dynamically construct the new stream object
        streamAggregate.payload.organisationName = organisationAggregate.payload.name;
        streamAggregate.payload.organisationLevel = organisationAggregate.payload.level;

       if (!streamAggregate.payload.organisationLevel) {
        return { success: false, message: "updateStreamFromChangeInOrganisation: Missing required - Level - fields in event data" };
       }    
        

    console.log ("Stream... Stream to update based on organisation id ", streamAggregate);
  
    // Validate inputs
    if (! streamAggregate.aggregateId || !streamAggregate.payload.organisationName ) {
      return { success: false, message: "updateStreamFromChangeInOrganisation: Missing required - name - fields in event data" };
    }
  
  console.log ("Strategy stream about to update", streamAggregate);
  
    // Save the strategy item (replace with your actual saving logic)
  let savedStrategyStream;

    try {
      console.log ("Strategy stream... saving");
      savedStrategyStream = await sendStreamUpdated(streamAggregate);
      console.log ("updateStreamFromChangeInOrganisation saved", savedStrategyStream);
      return { ...savedStrategyStream };
    } catch (error) {
      return { success: false, message: `Error creating strategy stream : ${error.message}` };
    }
  }

