import { createStreamFromNewOrganisation } from '../model/createStrategyStream';

export async function createStreamFromNewOrganisationHandler(command) {
    // Implement your strategy creation logic here
    console.log('createStreamFromNewOrganisationHandler: Strategy Creating with radar data:', command.aggregateId);
    console.log('createStreamFromNewOrganisationHandler: Strategy Creating with radar data:', command.payload.name);
    
    if (!command.aggregateId || !command.payload.name ) {
        return { success: false, message: "createStreamFromNewOrganisationHandler: <Missing required fields in event data." + command.name };
        }
    else
    {
       const result = await createStreamFromNewOrganisation(command)

       console.log ("createStreamFromNewOrganisationHandler: Strategy stream created", result);  
       return { result };     
    }
}


