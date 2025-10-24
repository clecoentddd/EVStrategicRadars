import {createStreamFromNewOrganisationHandler} from '../application/streamCreateHandler';
import {updateStreamFromChangeInOrganisationHandler} from '../application/strategyUpdateHandler';

export async function interfaceCreateStream(organisationAggregate) {

    console.log("PushAndSub createStreamFromNewOrganisation with organisationAggregate :", organisationAggregate);

    if (organisationAggregate.eventType === "RADAR_CREATED" ) {
        try {
            const stream = await createStreamFromNewOrganisationHandler(organisationAggregate);
        
            // ... use the created stream
            console.log ("interfaceCreateStream stream is: ", stream);
          } catch (error) {
              console.error('An unexpected error occurred in interfaceCreateStream:', error);
            }
          }
        };

export async function interfaceUpdateStream(organisationAggregate) {

    console.log("PushAndSub UpdateStream with organisationAggregate :", organisationAggregate);

    if (organisationAggregate.eventType === "RADAR_UPDATED" ) {
        try {
            const stream = await updateStreamFromChangeInOrganisationHandler(organisationAggregate);
        
            // ... use the created stream
            console.log ("interfaceUpdateStream stream is: ", stream);
            } catch (error) {
              console.error('An unexpected error occurred in interfaceUpdateStream:', error);
           }
    }
};