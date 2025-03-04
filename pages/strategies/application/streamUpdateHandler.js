import { updateStreamFromChangeInOrganisation} from '../model/updateStrategyStream';
import { getStreamByOrganisationId} from '../infrastructure/readModelStreams';
import { replayStream } from '../infrastructure/eventStoreStream';


export async function updateStreamFromChangeInOrganisationHandler(organisationAggregate) {
    // Implement your strategy update logic here
    console.log('updateStreamFromChangeInOrganisationHandler: Stream updating with organisation data:', organisationAggregate);
   
    if (!organisationAggregate.aggregateId ) {
        console.log ("Error. updateStreamFromChangeInOrganisationHandler: check error with id", organisationAggregate.aggregateId);
        return { success: false, message: "updateStreamFromChangeInOrganisationHandler: <Missing required fields in event data > : aggregateId." + organisationAggregate.aggregateId };
        }
    else
    {
        // return stream which has organisationId = radarId
        const streamAggregate = await getStreamByOrganisationId(organisationAggregate.aggregateId);
        
        console.log ("2. updateStreamFromChangeInOrganisationHandler: StreamId to update based on radar id ", streamAggregate.id);

        if (streamAggregate.id === null)
        {
            return { success: false, message: "3. updateStreamFromChangeInOrganisationHandler: <Stream not found with radar id: " + streamAggregate.aggregateId };
        }
        else {
            console.log ("4. updateStreamFromChangeInOrganisationHandler: Stream to update based on radar id ", streamAggregate);

            const streamAggregateReplayed = await replayStream(streamAggregate.id);
            console.log ("5. updateStreamFromChangeInOrganisationHandler: Stream to update based on radar id ", streamAggregateReplayed);
            const result = await updateStreamFromChangeInOrganisation(streamAggregateReplayed, organisationAggregate);
            console.log ("6. updateStreamFromChangeInOrganisationHandler: Strategy stream updated", result);   
            return result
        }          
    }
}

