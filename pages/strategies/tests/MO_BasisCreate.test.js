// import { describe, it, expect } from 'jest';
import { CreateStream, CreateStrategy, GetStrategyById } from '../model/strategy';
import { createStratregicElement, updateStratregicElement, deleteStratregicElement } from '../model/strategicElements';
import {replayElement} from '../infrastructure/eventStoreElements';


describe('Strategy Stream Tests', () => {

  let keepStreamId;
  let keepStrategyId;
  let keepElementId;
  

  it('should create the stream first', async () => {
  
    const streamToCreate = {
    id: '9573ace9-48f7-4410-9b21-3e52a3be3e7a',
    name: 'Strategy Stream v1.0',
    description: 'Description of the strategy stream',
    level: '1',
  };

  console.log ("Test: CreateStream for: ", streamToCreate);
  const savedStream = await CreateStream(streamToCreate);
  console.log ("Test: Stream saved is: ", savedStream);
  keepStreamId = savedStream.id ;
});


  it('should create the first version of the strategy', async () => {
    
    console.log ("Check Stream id :::", keepStreamId);
    const strategy = {
      stream_id: keepStreamId,
      name: 'First Version of Strategy for stream v1',
      description: 'Description of the first version of the strategy',
      period: '2025',
    };

    const savedStrategy = await CreateStrategy(strategy);

    console.log("Test: savedStrategy is", savedStrategy);

    keepStrategyId = savedStrategy.id;

    expect(savedStrategy.state).toBe('Open');

    console.log("Test: strategy is to create a new item", keepStrategyId);
    console.log("Test: stream is to create a new item", keepStreamId);
 

   });

it('should create a new strategic item for a given strategy', async () => {
    
  console.log("Test: strategy is to create a new item", keepStrategyId);
  console.log("Test: stream is to create a new item", keepStreamId);

  const newStratregicElement = {
      name: 'Unbalanaced Risk',
      stream_id: keepStreamId,
      strategy_id: keepStrategyId,
      period: '1 year',
      description: 'This is a test description',
      diagnosis: 'Some diagnosis',
      overall_approach: 'Some approach',
      setOfCoherentActions: ['Action 1', 'Action 2'],
      proximateObjectives: ['Objective 1', 'Objective 2'],
      tags: ['tag1', 'tag2'],
    };

    let sendItemCreated;

    sendItemCreated = await createStratregicElement(newStratregicElement);

    keepElementId = sendItemCreated.id;

    expect(keepElementId !== null);
    expect(sendItemCreated.state).toBe('Created');
  // console.log( "Event created recieved", sendItemCreated);

  });

  
  it('should update an existing strategic item', async () => {
    const secondStrategyItem = {
      id: keepElementId,
      stream_id: keepStreamId,
      strategy_id: keepStrategyId,
      name: 'Updated Name',
      period: '2 years',
      description: "New description",
      diagnosis: 'Some diagnosis 2',
      overall_approach: 'Some approach 2',
      setOfCoherentActions: ['Action 3', 'Action 4'],
      proximateObjectives: ['Objectivee4', 'Objective 5'],
      tags: ['tag4', 'tag3'],
    };

       const sendItemUpdated = await updateStratregicElement(secondStrategyItem);

    expect(sendItemUpdated.name).toBe(secondStrategyItem.name);
    expect(sendItemUpdated.state).toBe('Updated');
  });

  it('should delete a strategic item', async () => {

    console.log("Test: element id prior to delete it :", keepElementId);
    console.log("Test: strategy is to create a new item", keepStrategyId);
    console.log("Test: stream is to create a new item", keepStreamId);

    const EventToDelete = {
        id: keepElementId,
        stream_id: keepStreamId,
        strategy_id: keepStrategyId,
    }
    
    const sendItemDeleted = await deleteStratregicElement(EventToDelete);

    const checkedFinalEvent = replayElement(sendItemDeleted);
    // aggregate is finally
    console.log("Final aggregate is:", checkedFinalEvent );
    expect(sendItemDeleted.state).toBe('Deleted');
    expect(sendItemDeleted.id).toBe(keepElementId);
    
  });
});