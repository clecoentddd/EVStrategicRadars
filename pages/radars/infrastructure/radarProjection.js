import { supabase } from '../../../utils/supabaseClient'; // Supabase client library

/**
 * Project a radar creation event into the Supabase "radars" table.
 * @param {Object} radar - The radar object containing id, name, description, level, and created_at.
 * @returns {Promise<Object>} The result of the Supabase insert operation.
 */
export async function projectRadarToSupabase(radar) {
  try {
    // Check .env.local values
    console.log('radarProjections URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('radarProjections Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const { data, error } = await supabase
      .from("radars")
      .insert([
        {
          name: radar.name,
          description: radar.description,
          org_level: radar.level,
        },
      ]);

    if (error) {
      console.log("Error projecting radar to Supabase:", error.message);
      throw new Error("Failed to project radar to Supabase.");
    }

    console.log("Radar successfully projected to Supabase:", data);
    return data;
  } catch (err) {
    console.log("Unexpected error in projecting radar:", err.message);
    throw err;
  }
}

/**
 * Test Supabase connection by querying the "radars" table.
 */
export async function testConnection() {
  try {
    console.log('ES3 radarProjections URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('ES3 radarProjections Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const { data, error } = await supabase.from("radars").select("*");

    if (error) {
      console.log('ES3 radarProjections URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log("Supabase connection test failed:", error.message);
      throw new Error("Supabase connection failed.");
    }

    console.log("Supabase connection successful:", data);
    return data;
  } catch (err) {
    console.log("Unexpected error in testConnection:", err.message);
    throw err;
  }
}
