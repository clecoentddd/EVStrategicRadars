import { supabase } from '../../utils/supabaseClient';

export default async function handler(req, res) {
  try {
    console.log('Received request:', req.method);

    // Fetch all data in parallel
    const [
      { data: streams, error: streamsError },
      { data: strategies, error: strategiesError },
      { data: initiatives, error: initiativesError }
    ] = await Promise.all([
      supabase.from('projection_strategic_streams').select('*').order('organisationLevel'),
      supabase.from('projection_strategies').select('*'),
      supabase.from('projection_initiatives').select('*')
    ]);

    // Log fetched data or errors
    if (streamsError) console.error('Streams fetch error:', streamsError);
    if (strategiesError) console.error('Strategies fetch error:', strategiesError);
    if (initiativesError) console.error('Initiatives fetch error:', initiativesError);

    console.log('Fetched streams:', streams?.length);
    console.log('Fetched strategies:', strategies?.length);
    console.log('Fetched initiatives:', initiatives?.length);

    if (streamsError || strategiesError || initiativesError) {
      throw new Error('Failed to fetch data from Supabase');
    }

    const sortedStreams = [...streams].sort((a, b) => a.organisationLevel - b.organisationLevel);
    // Build the tree structure
    const tree = sortedStreams.map(stream => {
      console.log('Processing stream:', stream.id, stream.organisationName);

      const streamStrategies = strategies
        .filter(s => s.stream_id === stream.id && s.state === 'Published')
        .map(strategy => {
          console.log('  Found strategy:', strategy.id, strategy.name);

          const strategyInitiatives = initiatives.filter(i => i.strategy_id === strategy.id);
          console.log('    Initiatives for strategy:', strategy.id, strategyInitiatives.length);

          const avgProgress = strategyInitiatives.length > 0
            ? Math.round(
                strategyInitiatives.reduce((sum, i) => sum + (i.progress || 0), 0) / strategyInitiatives.length
              )
            : 0;

          console.log('    Calculated avgProgress:', avgProgress);

          return {
            type: 'strategy',
            id: strategy.id,
            name: strategy.name,
            avgProgress,
            children: strategyInitiatives.map(initiative => ({
              type: 'initiative',
              id: initiative.id,
              name: initiative.name,
              progress: initiative.progress || 0
            }))
          };
        });

      if (streamStrategies.length === 0) {
        console.log('  No published strategies for stream:', stream.id);
      }

      return {
        type: 'organization',
        id: stream.id,
        name: stream.organisationName,
        level: stream.organisationLevel,
        children: streamStrategies.length > 0
          ? streamStrategies
          : [{ type: 'message', content: 'No published strategy' }]
      };
    });

    console.log('Final tree structure:', JSON.stringify(tree, null, 2));

    res.status(200).json(tree);
  } catch (error) {
    console.error('Error building tree:', error);
    res.status(500).json({ error: error.message });
  }
}
