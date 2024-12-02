

  import { createANewStrategicItem, updateANewStrategicItem, deleteANewStrategicItem } from '../model/strategyItems';
  import {replayAggregate} from '../infrastructure/eventStoreStrategicItems';
  
  describe('Strategic Item Functions', () => {

    let strategyItem_id;

    it('should create a new strategic item', async () => {
      const newStratregicVersion = {
        stream_id: 'some-id-12344555',
        name: 'Test Item',
        period: '1 year',
        description: 'This is a test description',
        diagnosis: 'Some diagnosis',
        overallApproach: 'Some approach',
        setOfCoherentActions: ['Action 1', 'Action 2'],
        proximateObjectives: ['Objective 1', 'Objective 2'],
        tags: ['tag1', 'tag2'],
      };

      let sendItemCreated;
  
      sendItemCreated = await createANewStrategicItem(newStratregicVersion);
  
      strategyItem_id = sendItemCreated.aggregate_id;

      console.log ("1 test aggregate_id :", strategyItem_id);

      console.log('test Saved Item  getting is:', sendItemCreated);

      expect(strategyItem_id !== null);
      expect(sendItemCreated.state).toBe('Created');
    // console.log( "Event created recieved", sendItemCreated);

    });

    
    it('should update an existing strategic item', async () => {
      const secondStrategyVersion = {
        stream_id: 'some-id-12344555',
        aggregate_id: strategyItem_id,
        name: 'Updated Name',
        period: '2 years',
        description: "New description",
        diagnosis: 'Some diagnosis 2',
        overallApproach: 'Some approach 2',
        setOfCoherentActions: ['Action 3', 'Action 4'],
        proximateObjectives: ['Objectivee4', 'Objective 5'],
        tags: ['tag4', 'tag3'],
      };

      console.log ("2 test aggregate_id :", strategyItem_id);
  
      const sendItemUpdated = await updateANewStrategicItem(secondStrategyVersion);
  
      expect(sendItemUpdated.name).toBe(secondStrategyVersion.name);
      expect(sendItemUpdated.state).toBe('Updated');
    });
  
    it('should delete a strategic item', async () => {
  
      console.log ("3 test aggregate_id :", strategyItem_id);

      console.log ("test prior to deleted aggregate_id :", strategyItem_id);
      
      const sendItemDeleted = await deleteANewStrategicItem(strategyItem_id);
  
      const checkedFinalEvent = replayAggregate(strategyItem_id);
      // aggregate is finally
      console.log("Final aggregate is:",checkedFinalEvent );
      expect(sendItemDeleted.state).toBe('Deleted');
      
    });
  });