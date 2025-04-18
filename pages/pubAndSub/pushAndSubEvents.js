import { interfaceCreateStream, interfaceUpdateStream } from '../strategies/infrastructure/pubAndSubInterface';

const EventEmitter = require('events');

// Create an event emitter
const eventEmitter = new EventEmitter();

export function publishIntegrationEvent(eventData) {
  eventEmitter.emit('integrationEvent', eventData);
  console.log('Event published:', eventData);
}

export function subscribeToIntegrationEvents(callback) {
  eventEmitter.on('integrationEvent', callback);
}


// Ensure subscription happens early in the application lifecycle
subscribeToIntegrationEvents((eventData) => {
  console.log ("PubAndSub subscribeToIntegrationEvents...", eventData)
  
  switch (eventData.eventType) {
    case 'RADAR_CREATED':
      interfaceCreateStream(eventData);
      break;

    case 'RADAR_UPDATED':
      interfaceUpdateStream(eventData);
      break;

    default:
      console.warn(`Unhandled event type: ${eventType}`);
  }
});