// model/strategicItems.js
import {sendItemCreated, sendItemUpdated, sendItemDeleted} from "../infrastructure/eventStoreStrategicItems"

const validateStrategicItemCreation = (strategyAggregateId, name, period, description, diagnosis, overallApproach, setOfCoherentActions, proximateObjectives) => {
    if (!strategyAggregateId) throw new Error('Strategy aggregate ID is required.');
    if (!name) throw new Error('Name is required.');
    if (!description) throw new Error('Diagnosis is required.');
    if (!period) throw new Error('Overall approach is required.');

  };

  const validateStrategicItemUpdate = (AggregateId, name, period, description, diagnosis, overallApproach, setOfCoherentActions, proximateObjectives) => {
    if (!AggregateId) throw new Error('Strategy aggregate ID is required.');
    if (!name) throw new Error('Name is required.');
    if (!description) throw new Error('Diagnosis is required.');
    if (!period) throw new Error('Overall approach is required.');

  };
  
  // Command to create a new Strategic Item
  const createANewStrategicItem = async (strategyAggregateId, name, period, description, diagnosis, overallApproach, setOfCoherentActions, proximateObjectives, tags) => {
    validateStrategicItemCreation(strategyAggregateId, name, period, description, diagnosis, overallApproach, setOfCoherentActions, proximateObjectives);

    try {
        const savedItem = await sendItemCreated({
            strategyAggregateId,
            name,
            diagnosis,
            overallApproach,
            setOfCoherentActions,
            proximateObjectives,
            status: 'active',
            tags: tags || [],
        });
        return savedItem;
    } catch (error) {
        console.error('Error creating strategic item:', error);
        throw error;
    }
};
  
  // Command to update an existing Strategic Item
  const updateANewStrategicItem = async (aggregateId, name, period, description, diagnosis, overallApproach, setOfCoherentActions, proximateObjectives, tags) => {
   
     // check basic logic
     validateStrategicItemUpdate(aggregateId, name, period, description, diagnosis, overallApproach, setOfCoherentActions, proximateObjectives);
      
    // Calls the event store to send the update eve diagnosisnt
    let updatedEvent;

    updatedEvent = await sendItemUpdated({
      aggregateId,
      name,
      period,
      description,
      diagnosis,
      overallApproach,
      setOfCoherentActions,
      proximateObjectives,
      status: status || 'active',
      tags: tags || [],
    });
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
  
  module.exports = {
    createANewStrategicItem,
    updateANewStrategicItem,
    deleteANewStrategicItem,
  };
  