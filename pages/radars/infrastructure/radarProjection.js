import { supabase } from "../../../utils/supabaseClient";

export async function projectRadarToSupabase(eventType, radar) {
  try {
    console.log("projectRadarToSupabase - data to insert:", radar);
    console.log("projectRadarToSupabase - eventType is:", eventType);
    // Validate radar object
    if (!radar.id) {
      throw new Error("Invalid radar object received. Missing payload.");
    }

    // Handle RADAR_CREATED event
    if (eventType === "RADAR_CREATED") {
      const { data, error } = await supabase
        .from('radars')
        .insert([
          {
            id: radar.id,
            name: radar.name,
            purpose: radar.purpose,
            level: radar.level,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error("Error inserting radar to Supabase:", error.message);
        throw new Error(`Error inserting radar into Supabase: ${error.message}`);
      }

      return data; // Return inserted radar data
    }

    // Handle RADAR_UPDATED event (or default behavior)
    if (eventType === "RADAR_UPDATED") {
    const { data, error } = await supabase
      .from('radars')
      .update({
        name: radar.name,
        purpose: radar.purpose,
        level: radar.level,
        updated_at: new Date().toISOString(),
      })
      .match({ id: radar.id })
      .select('*');
      
      console.log("projectRadarToSupabase - data returned from supabase:", data);

    if (error) {
      console.log("Error updating radar in Supabase:", error.message);
      throw new Error(`Error updating radar in Supabase: ${error.message}`);
    }
  }

      // Handle RADAR_UPDATED event (or default behavior)
      if (eventType === "RADAR_DELETED") {
        const { data, error } = await supabase
          .from('radars')
          .delete({
            name: radar.name,
            purpose: radar.purpose,
            level: radar.level,
            updated_at: new Date().toISOString(),
          })
          .match({ id: radar.id })
          .select('*');
    
        if (error) {
          console.log("Error updating radar in Supabase:", error.message);
          throw new Error(`Error updating radar in Supabase: ${error.message}`);
        }
      }

    // return data; // Return updated radar data (or undefined if not found)
  } catch (error) {
    console.error("Error upserting radar:", error.message);
    throw error;
  }

}
export async function projectRadarToSupabase2(eventType, radar) {
  // console.log("Entering Projection: Radar to project to Supabase:", radar);
    if (!radar.id) {
      throw new Error("Invalid radar object received. Missing payload.");
    }
    console.log("About to delete in supabase item whose id is: ", radar.id);
    try {
      if (eventType === "RADAR_DELETED") { 
        const { error } = await supabase
          .from('radars')
          .delete()
          .match({ id: radar.id });
  
        if (error) {
          console.log("Error deleting radar:", error.message);
          throw new Error(`Error deleting radar in Supabase: ${error.message}`);
        }
  
        return true; // Indicate successful deletion
      } else {
        console.warn("Received unexpected event type for deletion:", eventType);
        return false; // Indicate that no deletion was performed
      }
    } catch (error) {
      console.error("Error deleting radar:", error.message);
      throw error; 
    }
  }
