import {createStreamHandler} from '../application/strategyStreamHandler';

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