import { supabase } from "../../../utils/supabaseClient";

export async function projectOrganisationToSupabase(radar) {
  try {
    console.log("projectOrganisationToSupabase - data to insert:", radar);
   
    // Validate radar object
    if (!radar.aggregateId) {
      throw new Error("Invalid radar object received. Missing payload.");
    }

    // Handle RADAR_CREATED event
    if (radar.eventType === "RADAR_CREATED") {
      const { data, error } = await supabase
        .from('projection_organisation_list')
        .insert([
          {
            id: radar.aggregateId,
            name: radar.payload.name,
            purpose: radar.payload.purpose,
            context: radar.payload.context,
            level: radar.payload.level,
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
    if (radar.eventType === "RADAR_UPDATED") {
    const { data, error } = await supabase
      .from('projection_organisation_list')
      .update({
        name: radar.payload.name,
        purpose: radar.payload.purpose,
        context: radar.payload.context,
        level: radar.payload.level,
        updated_at: new Date().toISOString(),
      })
      .match({ id: radar.aggregateId })
      .select('*');
      
      console.log("projectOrganisationToSupabase - data returned from supabase:", data);

    if (error) {
      console.log("Error updating radar in Supabase:", error.message);
      throw new Error(`Error updating radar in Supabase: ${error.message}`);
    }
  }

      // Handle RADAR_UPDATED event (or default behavior)
      if (radar.eventType === "RADAR_DELETED") {
        const { data, error } = await supabase
          .from('projection_organisation_list')
          .delete()
          .match({ id: radar.aggregateId })
          .select('*'); // Returns the deleted row
    
        if (error) {
          console.log("Error updating organisation in Supabase:", error.message);
          throw new Error(`Error updating organisation in Supabase: ${error.message}`);
        }
      }

    // return data;
  } catch (error) {
    console.error("Error upserting organisation:", error.message);
    throw error;
  }
}
