import {createStreamHandler} from '../application/streamCreateHandler';
import {updateStreamHandler} from '../application/streamupdateHandler';

export async function interfaceCreateStream(command) {

    console.log("PushAndSub createStream with command :", command.payload);

    if (command.eventType === "RADAR_CREATED" ) {
        try {
            const stream = await createStreamHandler(command.payload);
        
            // ... use the created stream
            console.log ("interfaceCreateStream stream is: ", stream);
          } catch (error) {
              console.error('An unexpected error occurred in interfaceCreateStream:', error);
            }
          }
        };

export async function interfaceUpdateStream(command) {

    console.log("PushAndSub updateStream with command :", command);

    if (command.eventType === "RADAR_UPDATED" ) {
        try {
            const stream = await updateStreamHandler(command.payload);
        
            // ... use the created stream
            console.log ("interfaceUpdateStream stream is: ", stream);
            } catch (error) {
              console.error('An unexpected error occurred in interfaceUpdateStream:', error);
           }
    }
};