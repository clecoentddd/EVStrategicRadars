// utils/GetRadarData.js
import { supabase } from '../../utils/supabaseClient';

/**
 * Fetches radar data from Supabase and returns it as JSON.
 * This function abstracts away all DB logic so components
 * only deal with plain JSON data.
 *
 * @param {string} radarId - The ID of the radar or organisation to fetch.
 * @returns {Promise<Object[]>} - Returns an array of radar items.
 */
export async function GetRadarData(radarId) {
  try {
    // Adjust the table name and columns to match your schema
    const { data, error } = await supabase
      .from('projection_items') // <-- your radar data table
      .select('*')
      .eq('radar_id', radarId); // filter by radarId (optional)

    if (error) {
      console.error('Error fetching radar data:', error.message);
      throw error;
    }

    // Return plain JSON
    return data || [];
  } catch (err) {
    console.error('Unexpected error in GetRadarData:', err);
    return [];
  }
}

/**
 * Optional helper for fetching a radar/organisation name
 * (used for zoom-in details in tooltips)
 */
export async function GetRadarName(radarId) {
  try {
    const { data, error } = await supabase
      .from('projection_organisation_list')
      .select('name')
      .eq('id', radarId)
      .single();

    if (error) {
      console.error('Error fetching radar name:', error.message);
      return 'Error fetching organisation';
    }

    return data?.name || 'No name available';
  } catch (err) {
    console.error('Unexpected error in GetRadarName:', err);
    return 'Error fetching organisation';
  }
}
