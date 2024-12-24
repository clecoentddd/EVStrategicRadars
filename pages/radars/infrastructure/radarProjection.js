import { supabase } from "../../../utils/supabaseClient";

export async function projectRadarToSupabase(radar) {
  // console.log("Entering Projection: Radar to project to Supabase:", radar);
  try {
    if (!radar) {
      throw new Error("Invalid radar object received. Missing payload.");
    }
    
   // console.log("Projection: Radar to project to Supabase:", radar);

    // Ensure radar has all the expected properties
    const { name, description, level, id } = radar;
    //bconsole.log("Extracted values:", { name, description, level, id });

    // Proceed with the Supabase insertion
    const { data, error } = await supabase
      .from("radars")
      .insert([
        {
          id: radar.radarId,
          name: radar.name,
          description: radar.description,
          level: radar.level,
          created_at: new Date().toISOString(), // Set creation time
          updated_at: new Date().toISOString(), // Set creation time
        }
      ])
      .select();
    // Check for any error during insertion
    if (error) {
      console.log("Error projecting radar to Supabase:", error.message);
      throw new Error(`Error inserting radar into Supabase: ${error.message}`);
    }

    // Log the successfully inserted data
    console.log("Radar successfully projected to Supabase:", data);

    // Since Supabase doesn't automatically return the inserted data after .insert(),
    // return the data manually or handle as necessary.
    return data;
  } catch (err) {
    console.log("Unexpected error in projecting radar:", err.message);
    throw err; // Propagate the error if needed
  }
}
