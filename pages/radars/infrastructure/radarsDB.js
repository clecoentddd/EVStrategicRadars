// pages/radars/infrastructure/radars.js
import { supabase } from '../../../utils/supabaseClient';

/**
 * Fetch all radars from the database.
 * @returns {Promise<Object[]>} List of radars from the database.
 */
export async function fetchAllRadars() {
  try {
    console.log('Attempting to fetch radars from Supabase...');
    const { data, error } = await supabase.from("radars").select("*");

    if (error) {
      console.error("Error fetching radars from Supabase:", error.message);
      throw new Error("Failed to fetch radars.");
    }

    // console.log("Fetched radars successfully:", data);
    return data;
  } catch (err) {
    console.error("Unexpected error in fetchAllRadars:", err.message);
    throw err;
  }
}

// radarsDB.js (or the appropriate file)
export async function fetchRadarById(aggregateId) {
  // Fetch radar by its aggregate_id from the database (or in-memory data structure)
  const radars = await fetchAllRadars(); // Assuming fetchAllRadars fetches all the radars
  console.log("MODEL fetchAllRadars :", radars);
  return radars.find(radar => radar.id === aggregateId); // Find and return the radar
}


