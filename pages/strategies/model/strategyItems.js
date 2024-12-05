// model/strategicItems.js
import {sendItemCreated, sendItemUpdated, sendItemDeleted} from '../infrastructure/eventStoreStrategicItems';

const validateStrategicItemCreation = (command) => {
    if (!command.version_id) throw new Error('Strategy version ID is required.');
    if (!command.name) throw new Error('Name is required.');
    if (!command.description) throw new Error('Diagnosis is required.');
    if (!command.period) throw new Error('Overall approach is required.');

  };

  const validateStrategicItemUpdate = (command) => {
    console.log("validateStrategicItemUpdate - id is : ", command.id);
    if (!command.id) throw new Error('Strategy aggregate item ID is required.');
    if (!command.name) throw new Error('Name is required.');
    if (!command.description) throw new Error('Diagnosis is required.');
    if (!command.period) throw new Error('Overall approach is required.');

  };
  
  // Command to create a new Strategic Item
  const createANewStrategicItem = async (command) => {
    console.log("validateStrategicItemCreation input: ", command);
    
    validateStrategicItemCreation(command);

    try {
        const savedItem = await sendItemCreated(command);
        return savedItem;
    } catch (error) {
        console.error('Error creating strategic item:', error);
        throw error;
    }
};
  
  // Command to update an existing Strategic Item
  const updateANewStrategicItem = async (command) => {
     console.log ("updateANewStrategicItem -> command", command);
     // check basic logic
     validateStrategicItemUpdate(command);
      
    // Calls the event store to send the update eve diagnosisnt
    let updatedEvent;

    updatedEvent = await sendItemUpdated(command);

    console.log ("updateANewStrategicItem - Event after update", updatedEvent);

    return updatedEvent
  };
  
  // Command to delete a Strategic Item
  
  const deleteANewStrategicItem = async (aggregateId) => {
    if (!aggregateId) throw new Error('Aggregate ID is required.');
  
    // Calls the event store to send the delete event
    let deletedEvent;

    deletedEvent = await sendItemDeleted({
      aggregateId,
    });

    return deletedEvent;
  };
  
  export { createANewStrategicItem, updateANewStrategicItem, deleteANewStrategicItem };
  