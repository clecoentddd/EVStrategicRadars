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

// strategy.js
//import { subscribeToIntegrationEvents } from './pushAndSubEvents';
import { CreateStream } from '../strategies/model/strategy';

// Ensure subscription happens early in the application lifecycle
subscribeToIntegrationEvents((eventData) => {
  console.log ("PubAndSub subscribeToIntegrationEvents...", eventData.payload)
  CreateStream(eventData.payload);
});