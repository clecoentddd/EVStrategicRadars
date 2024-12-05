// import { describe, it, expect } from 'jest';
import { CreateStrategyStream, CreateNewVersionOfStrategy, GetStrategyById } from '../model/strategy';
import { createANewStrategicItem, updateANewStrategicItem, deleteANewStrategicItem } from '../model/strategyItems';
import {replayItem} from '../infrastructure/eventStoreStrategicItems';


describe('Strategy Stream Tests', () => {

  let strategyStreamById;
  let strategyVersionV1Id;
  let strategyVersionV2Id;
  let strategyItem_id;
  

  it('should create the stream first', async () => {
    const streamCommand = {
      radar_id: 'id_radar_1234',
      name: 'Strategy Stream v1.0',
      description: 'Description of the strategy stream',
      level: '1',
    };

    const savedStream = await CreateStrategyStream(streamCommand);

    strategyStreamById = savedStream.id ;

    console.log ("Test savedStream ::", savedStream);
    console.log ("Test Stream id ::", strategyStreamById);

    expect(savedStream.state).toBe('Open');
    expect(strategyStreamById).not.toBeNull();

  });

  it('should create the first version of the strategy', async () => {
    
    console.log ("Check Stream id :::", strategyStreamById);
    const firstVersionCommand = {
      stream_id: strategyStreamById,
      name: 'First Version of Strategy for stream v1',
      description: 'Description of the first version of the strategy',
      period: '2025',
    };

    const firstVersion = await CreateNewVersionOfStrategy(firstVersionCommand);

    strategyVersionV1Id = firstVersion.id;

    expect(firstVersion.state).toBe('Open');


  });

  it('should create the second strategy', async () => {
    const secondVersionCommand = {
      stream_id: strategyStreamById,
      name: 'Second Version of Strategy for stream v1',
      description: 'Description of the second version of the strategy',
      period: '2026'
    };

    const secondVersion = await CreateNewVersionOfStrategy(secondVersionCommand);

    console.log ("Test Second version is from await", secondVersion);

    strategyVersionV2Id = secondVersion.id;

    console.log ("Test Second version id to use is", strategyVersionV2Id);

    console.log ("Check first version has been close", strategyVersionV1Id);

    const previousVersionShouldBeClose = await GetStrategyById(strategyVersionV1Id);


    console.log("The 2nd version of strategy to use ", strategyVersionV2Id);

    console.log ("First version should be closed",previousVersionShouldBeClose );
    expect(secondVersion.state).toBe('Open');
  });

it('should create a new strategic item for a given strategy', async () => {
    
  console.log("The 2nd version of strategy is to create a new item", strategyVersionV2Id);

  const newStratregicItem = {
      version_id: strategyVersionV2Id,
      name: 'Version v2',
      period: '1 year',
      description: 'This is a test description',
      diagnosis: 'Some diagnosis',
      overallApproach: 'Some approach',
      setOfCoherentActions: ['Action 1', 'Action 2'],
      proximateObjectives: ['Objective 1', 'Objective 2'],
      tags: ['tag1', 'tag2'],
    };

    let sendItemCreated;

    sendItemCreated = await createANewStrategicItem(newStratregicItem);

    strategyItem_id = sendItemCreated.id;

    console.log ("1 test aggregate_id :", strategyItem_id);

    console.log('test Saved Item  getting is:', sendItemCreated);

    expect(strategyItem_id !== null);
    expect(sendItemCreated.state).toBe('Created');
  // console.log( "Event created recieved", sendItemCreated);

  });

  
  it('should update an existing strategic item', async () => {
    const secondStrategyItem = {
      version_id: strategyVersionV2Id,
      id: strategyItem_id,
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

    const sendItemUpdated = await updateANewStrategicItem(secondStrategyItem);

    expect(sendItemUpdated.name).toBe(secondStrategyItem.name);
    expect(sendItemUpdated.state).toBe('Updated');
  });

  it('should delete a strategic item', async () => {

    console.log ("test prior to deleted aggregate_id :", strategyItem_id);
    
    const sendItemDeleted = await deleteANewStrategicItem(strategyItem_id);

    const checkedFinalEvent = replayItem(strategyItem_id);
    // aggregate is finally
    console.log("Final aggregate is:",checkedFinalEvent );
    expect(sendItemDeleted.state).toBe('Deleted');
    
  });

});