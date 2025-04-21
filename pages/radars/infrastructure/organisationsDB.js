// pages/radars/infrastructure/radars.js
import { supabase } from '../../../utils/supabaseClient';

/**
 * Fetch all radars from the database.
 * @returns {Promise<Object[]>} List of radars from the database.
 */
export async function fetchAllRadars() {
  try {
    console.log('Attempting to fetch organisations from Supabase...');
    const { data, error } = await supabase.from("projection_organisation_list").select("*");

    if (error) {
      console.error("Error fetching radars from Supabase:", error.message);
      throw new Error("Failed to fetch radars.");
    }

    console.log("radarDB.js: Fetched radars:", data);
    return data;
  } catch (err) {
    console.error("Unexpected error in fetchAllRadars:", err.message);
    throw err;
  }
}

// organisationsDB.js (or the appropriate file)
export async function fetchRadarById(aggregateId) {
  // Fetch radar by its id from the database (or in-memory data structure)
  const radars = await fetchAllRadars(); // Assuming fetchAllRadars fetches all the radars
  console.log("radarDB.js:  fetchadarById :", radars);
  return radars.find(radar => radar.id === aggregateId); // Find and return the radar
}


