import { supabase } from '../../utils/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Handle POST request (save data)
    console.log('ai-coach-saving-nps : Request Body:', req.body); // Log the request body

    const { radarId, potentialNPS, evaluations, suggestions } = req.body;

    // Validate the request body
    if (!radarId || !potentialNPS || !evaluations || !suggestions) {
      console.log("Found empty values for radarId:", radarId);
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: radarId, potentialNPS, evaluations, or suggestions.',
      });
    }

    try {
      // Save the data to Supabase
      const { data, error } = await supabase
        .from('ai_purpose_rating')
        .insert([
          {
            radarId: radarId,
            potentialNPS: potentialNPS,
            evaluations: evaluations,
            suggestions: suggestions,
          },
        ])
        .select();

      if (error) {
        console.error('Error saving to Supabase:', error.message);
        throw error;
      }

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Data saved successfully.',
        data: data,
      });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to save data to Supabase.',
      });
    }
  } else if (req.method === 'GET') {
    // Handle GET request (retrieve latest entry for a radarId)
    const { radarId } = req.query; // Get radarId from query parameters

    // Validate the radarId
    if (!radarId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required query parameter: radarId.',
      });
    }

    try {
      // Fetch the latest entry for the given radarId
      const { data, error } = await supabase
        .from('ai_purpose_rating')
        .select('radarId, potentialNPS, evaluations, suggestions, created_at')
        .eq('radarId', radarId) // Filter by radarId
        .order('created_at', { ascending: false }) // Sort by created_at in descending order
        .limit(1); // Limit to 1 result (latest entry)

      if (error) {
        console.error('Error fetching from Supabase:', error.message);
        throw error;
      }

      // Return success response with the fetched data
      res.status(200).json({
        success: true,
        message: 'Latest data retrieved successfully.',
        data: data.length > 0 ? data[0] : null, // Return the first (and only) entry
      });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch data from Supabase.',
      });
    }
  } else {
    // Handle unsupported methods
    res.status(405).json({ message: 'Method not allowed' });
  }
}