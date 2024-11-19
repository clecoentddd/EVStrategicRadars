import { supabase } from '../../../utils/supabaseClient';// Supabase client library


/**
 * Project a radar creation event into the Supabase "radars" table.
 * @param {Object} radar - The radar object containing id, name, description, level, and created_at.
 * @returns {Promise<Object>} The result of the Supabase insert operation.
 */
export async function projectRadarToSupabase(radar) {
  try {
    // Check .env.local are picked up
    console.log('radarProjections URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('radarProjections Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data, error } = await supabase
      .from("radars")
      .insert([
        {
          // id: radar.id,
          name: radar.name,
          description: radar.description,
          org_level: radar.level,
          // created_at: new Date().toISOString(), // Use current timestamp
        },
      ]);

    if (error) {
      console.error("Error projecting radar to Supabase:", error.message);
      throw new Error("Failed to project radar to Supabase.");
    }

    console.log("Radar successfully projected to Supabase:", data);
    return data;
  } catch (err) {
    console.error("Unexpected error in projecting radar:", err.message);
    throw err;
  }
}


const testConnection = async () => {
  try {
    const { data, error } = await supabase.from("radars").select("*");
    if (error) {
      console.error("Supabase connection test failed:", error.message);
    } else {
      console.log("Supabase connection successful:", data);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
};
testConnection();
