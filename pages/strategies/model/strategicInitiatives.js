// model/StratregicElements.js
import {sendInitativeCreated, sendInitativeUpdated, sendInitativeDeleted} from '../infrastructure/eventStoreInitiatives';

const validateStratregicElementCreation = (command) => {
    if (!command.strategy_id) throw new Error('Strategy version ID is required.');
    if (!command.name) throw new Error('Name is required.');
    if (!command.stream_id) throw new Error ('A strategic element must belong to a stream');

  };

  const validateStratregicInitiativeUpdate = (command) => {
    console.log("validateStratregicInitiativeUpdate - id is : ", command.initiativeId);
    if (!command.initiativeId) throw new Error('Strategy aggregate item ID is required.');
    // if (!command.name) throw new Error('Name is required.');
    // if (!command.description) throw new Error('Description is required.');
    if (!command.stream_id) throw new Error ('Stream id missing in strategy.');
    if (!command.strategy_id) throw new Error ('Strategy id missing in strategy.');
  };
  
  // Command to create a new Strategic Item
  const createStratregicInitiative = async (command) => {
    console.log("validateStratregicElementCreation input: ", command);
    
    validateStratregicElementCreation(command);

    try {
        const savedItem = await sendInitativeCreated(command);
        return savedItem;
    } catch (error) {
        console.error('Error creating strategic item:', error);
        throw error;
    }
};
  
  // Command to update an existing Strategic Item
  const updateStratregicInitiative = async (command) => {
     console.log ("updateStratregicInitiative -> command", command);
     // check basic logic
     validateStratregicInitiativeUpdate(command);
      
    // Calls the event store to send the update eve diagnosisnt
    let updatedEvent;

    updatedEvent = await sendInitativeUpdated(command);

    console.log ("updateStratregicInitiative - Event after update", updatedEvent);

    return updatedEvent
  };
  
  // Command to delete a Strategic Item
  
  const deleteStratregicInitiative = async (command) => {
    if (!command.id || ! command.stream_id || !command.strategy_id) throw new Error('Aggregate ID is required.');
  
    // Calls the event store to send the delete event
    let deletedEvent;

    deletedEvent = await sendInitativeDeleted({...command});

    console.log("Tracking deleted event back to front", deletedEvent);

    return deletedEvent;
  };

  const returningStratregicInitiative = async (command) => {
    if (!command.id || ! command.stream_id || !command.strategy_id) throw new Error('Aggregate ID is required.');
  
    // Calls the event store to send the delete event
    let replayedEvent;

    replayedEvent = await replayedEvent({...command});

    console.log("MODEL replayied event back to front", replayedEvent);

    return replayedEvent;
  };
  
  
  export { createStratregicInitiative, updateStratregicInitiative, deleteStratregicInitiative, returningStratregicInitiative, };
  