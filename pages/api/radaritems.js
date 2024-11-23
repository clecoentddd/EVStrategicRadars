// READ of CQRS
import { fetchAllRadarItemsByRadarId } from "../radars/infrastructure/radarItemsDB"; // Adjust the path if necessary

// WRITE of CQRS
import {handleRadarItemCreation, updateRadarItem} from "../radars/model/radarItems"

export default async function handler(req, res) {
  console.log("Body received:", req.body);
  
  // Debugging: Log the URL to verify it's correct
  // Log details of the request
  console.log("Incoming Request:");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Query Params:", req.query);
  console.log("Body:", JSON.stringify(req.body, null, 2));

  try {
    if (req.method === "GET") {
      const { radar_id } = req.query;  // Extract radar_id from query params
  
      if (!radar_id) {
        return res.status(400).json({ message: "Radar ID is required" });
      }
  
      try {
        // Fetch all radar items for the given radar_id
        const radarItems = await fetchAllRadarItemsByRadarId(radar_id);
  
        // Respond with the radar items or a message if none are found
        if (radarItems.length > 0) {
          return res.status(200).json(radarItems);
        } else {
          return res.status(404).json({ message: "No radar items found for this radar." });
        }
      } catch (error) {
        console.error("Error fetching radar items:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
      }

    } else if (req.method === "POST") {
      // Handle radar item creation logic
      const command = req.body;  // Get the payload from the request body
      console.log ("API Get the radar item to create: ", command )

      if (!command) {
       return res.status(400).json({ message: "Invalid request format. Payload is required." });
      }

      try {
        console.log ("API Creating the radar item: ", command )
        const result = await handleRadarItemCreation(command);
        if (result.success) {
          return res.status(201).json(result.radarItem);
        } else {
          return res.status(400).json({ message: result.message });
        }
      } catch (error) {
        console.error("Error creating radar item:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
      }
    } else if (req.method === "PUT" || req.method === "PATCH") {
      // Handle radar item update logic
      console.log("In the PUT Command", req.query);
      const { aggregate_id } = req.query; // Extract aggregate_id from query params
      console.log ("What aggregate?", aggregate_id);

      if (!aggregate_id) {
        return res.status(400).json({ error: 'Aggregate ID is required' });
      }
    
      // Use the aggregate_id in your logic
      console.log(aggregate_id); // This will print the aggregate_id, e.g., '1b03ea3c-9052-45cb-b9d0-f47065eb853f'
    
      const command = {
        ...req.body, // Directly spread the fields from req.body into the command object
        aggregate_id: aggregate_id // Add aggregate_id to the command
      };
      
      console.log ("API -< req.query is", req.query);
      console.log ("API -> aggregate is:", aggregate_id);
      console.log ("API -> PUT or PATCH updating the item for aggregate", command);

      if (!command) {
        return res.status(400).json({ message: "Payload is required" });
      }
      console.log ("API -> updatig the item")
      const updatedRadarItem = await updateRadarItem(command);

      if (updatedRadarItem) {
        return res.status(200).json(updatedRadarItem); // Respond with the updated radar item
      } else {
        return res.status(404).json({ message: "Radar item not found or failed to update" });
      }
    } else {
      // Method Not Allowed if the request is not GET, PUT, or PATCH
      res.setHeader("Allow", ["GET", "POST", "PUT", "PATCH"]);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
