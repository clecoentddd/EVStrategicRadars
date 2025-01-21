// model/StratregicElements.js
import {sendItemCreated, sendItemUpdated, sendItemDeleted} from '../service/eventStoreElements';

const validateStratregicElementCreation = (command) => {
    if (!command.strategy_id) throw new Error('Strategy version ID is required.');
    if (!command.name) throw new Error('Name is required.');
    if (!command.stream_id) throw new Error ('A strategic element must belong to a stream');

  };

  const validateStratregicElementUpdate = (command) => {
    console.log("validateStratregicElementUpdate - id is : ", command);
    if (!command.id) throw new Error('Strategy aggregate item ID is required.');
    // if (!command.name) throw new Error('Name is required.');
    // if (!command.description) throw new Error('Description is required.');
    if (!command.stream_id) throw new Error ('Stream id missing in strategy.');
    if (!command.strategy_id) throw new Error ('Strategy id missing in strategy.');
  };
  
  // Command to create a new Strategic Item
  const createStratregicElement = async (command) => {
    console.log("validateStratregicElementCreation input: ", command);
    
    validateStratregicElementCreation(command);

    try {
        const savedItem = await sendItemCreated(command);
        return savedItem;
    } catch (error) {
        console.error('Error creating strategic item:', error);
        throw error;
    }
};
  
  // Command to update an existing Strategic Item
  const updateStratregicElement = async (command) => {
     console.log ("updateStratregicElement -> command", command);
     // check basic logic
     validateStratregicElementUpdate(command);
      
    // Calls the event store to send the update eve diagnosisnt
    let updatedEvent;

    updatedEvent = await sendItemUpdated(command);

    console.log ("updateStratregicElement - Event after update", updatedEvent);

    return updatedEvent
  };
  
  // Command to delete a Strategic Item
  
  const deleteStratregicElement = async (command) => {
    if (!command.id || ! command.stream_id || !command.strategy_id) throw new Error('Aggregate ID is required.');
  
    // Calls the event store to send the delete event
    let deletedEvent;

    deletedEvent = await sendItemDeleted({...command});

    console.log("Tracking deleted event back to front", deletedEvent);

    return deletedEvent;
  };

  const returningStratregicElement = async (command) => {
    if (!command.id || ! command.stream_id || !command.strategy_id) throw new Error('Aggregate ID is required.');
  
    // Calls the event store to send the delete event
    let replayedEvent;

    replayedEvent = await replayedEvent({...command});

    console.log("MODEL replayied event back to front", replayedEvent);

    return replayedEvent;
  };
  
  
  export { createStratregicElement, updateStratregicElement, deleteStratregicElement, returningStratregicElement, };
  