

  import { createANewStrategicItem, updateANewStrategicItem, deleteANewStrategicItem } from '../model/strategyItems';
  import {replayAggregate} from '../infrastructure/eventStoreStrategicItems';
  
  describe('Strategic Item Functions', () => {

    let strategItem_id;

    it('should create a new strategic item', async () => {
      const strategyAggregateId = 'some-id-12344555';
      const name = 'Test Item';
      const period = '1 year';
      const description = 'This is a test description';
      const diagnosis = 'Some diagnosis';
      const overallApproach = 'Some approach';
      const setOfCoherentActions = ['Action 1', 'Action 2'];
      const proximateObjectives = ['Objective 1', 'Objective 2'];
      const tags = ['tag1', 'tag2'];

      let sendItemCreated;
  
      sendItemCreated = await createANewStrategicItem(strategyAggregateId, name, period, description, diagnosis, overallApproach, setOfCoherentActions, proximateObjectives, tags);
  
    strategItem_id = sendItemCreated.aggregateId;

    console.log('ID getting is:', strategItem_id);

    expect(strategItem_id !== null);
    expect(sendItemCreated.state).toBe('Created');
    // console.log( "Event created recieved", sendItemCreated);
 
    });
  
    it('should update an existing strategic item', async () => {
      const aggregateId = strategItem_id;
      const newName = 'Updated Name';
      const updatedPeriod = '2 years';
      const updatedDescription = "New description";
      const diagnosis = 'Some diagnosis';
      const overallApproach = 'Some approach';
      const setOfCoherentActions = ['Action 1', 'Action 2'];
      const proximateObjectives = ['Objective 1', 'Objective 2'];
      const tags = ['tag1', 'tag2'];

  
      const sendItemUpdated = await updateANewStrategicItem(aggregateId, newName, updatedPeriod, updatedDescription, diagnosis, overallApproach, setOfCoherentActions,proximateObjectives, tags);
  
      expect(sendItemUpdated.name).toBe(newName);
      expect(sendItemUpdated.state).toBe('Updated');
    });
  
    it('should delete a strategic item', async () => {
  
        const sendItemDeleted = await deleteANewStrategicItem(strategItem_id);
  
      const checkedFinalEvent = replayAggregate(strategItem_id);
      // aggregate is finally
      console.log("Final aggregate is:",checkedFinalEvent );
      expect(sendItemDeleted.state).toBe('Deleted');

      
    });
  });