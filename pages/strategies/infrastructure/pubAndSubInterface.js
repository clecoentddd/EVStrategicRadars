import {createStream} from '../model/strategy';

export async function interfaceCreateStream(command) {

    console.log("PushAndSub createStream with command :", command.payload);

    if (command.eventType === "RADAR_CREATED" ) {
        try {
            const stream = await createStream(command.payload);
        
            // ... use the created stream
            console.log ("interfaceCreateStream stream is: ", stream);
          } catch (error) {
              console.error('An unexpected error occurred in interfaceCreateStream:', error);
            }
          }
        };