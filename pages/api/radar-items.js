// READ of CQRS
import { fetchAllRadarItemsByRadarId } from "../radars/infrastructure/radarItemsDB"; // Adjust the path if necessary

// WRITE of CQRS
import {handleRadarItemCreate, handleRadarItemUpdate, getRadarItem} from "../radars/model/radaritems"; // Adjust the path if necessary

export default async function handler(req, res) {
  // console.log("Body received:", req.body);
  
  // Debugging: Log the URL to verify it's correct
  // Log details of the request
  console.log("Incoming Request:");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  //console.log("Query Params:", req.query);
  // console.log("Body:", JSON.stringify(req.body, null, 2));

  try {
    console.log("Entering API handler for radar_items.js", req.query);
    if (req.method === "GET") {
      console.log("GET for", req.body);
      const { radarId, id } = req.query; // Extract radarId and id

      if (id) {
        // Handle the new GET API for fetching radar item aggregate
        try {
          console.log("API Fetching radar item aggregate for:", id);
          const radarItem = await getRadarItem(id); // Call the model method
          console.log ("API -> ready to return aggregate :",radarItem);

          if (radarItem) {
            return res.status(200).json(radarItem); // Return the radar item aggregate
          } else {
            return res.status(404).json({ message: "Radar item aggregate not found." });
          }
        } catch (error) {
          console.error("Error fetching radar item aggregate:", error.message);
          return res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
      } else if (radarId) {
        // Existing GET API to fetch all radar items by radarId
        try {
          const radarItems = await fetchAllRadarItemsByRadarId(radarId);

          if (radarItems.length >= 0) {
            return res.status(200).json(radarItems);
          } else {
            return res.status(404).json({ message: "No radar items found for this radar." });
          }
        } catch (error) {
          console.error("Error fetching radar items:", error.message);
          return res.status(500).json({ message: "Internal Server Error" });
        }
      } else {
        return res.status(400).json({ message: "Either radarId or id is required." });
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
        const radarItem = await handleRadarItemCreate(command);
        console.log("API -> let us see what is in result.radarItem", radarItem)

        // Get response format ready for the front end
        if (radarItem.success) {
          // Transform the radarItem (original response) for optimistic UI
        const transformedResponse = {
          success: true,
          message: "Radar item created successfully",
          data: {
            id: radarItem.aggregateId,
            name: radarItem.payload.name,
            assess: radarItem.payload.assess,
            detect: radarItem.payload.detect,
            respond: radarItem.payload.respond,
            type: radarItem.payload.type,
            impact: radarItem.payload.impact,
            radarId: radarItem.payload.radarId,
            category: radarItem.payload.category,
            distance: radarItem.payload.distance,
            tolerance: radarItem.payload.tolerance,
            zoom_in: radarItem.payload.zoom_in,
            created_at: radarItem.created_at
          }
        };

        // Return the transformed response
        return res.status(201).json(transformedResponse);

        } else {
          return res.status(400).json({ message: radarItem.message });
        }
      } catch (error) {
        console.error("Error creating radar item:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
      }
    } else if (req.method === "PUT" || req.method === "PATCH") {
      // Handle radar item update logic
      
      const command = {
        ...req.query,
        ...req.body,
      };
      console.log ("API PUT the radar item to update: ", command )
  
      if (!command.id) {
        return res.status(400).json({ error: 'Radar item ID is required' });
      }
    
      console.log ("API -> req.query is", req.query);
      console.log ("API -> PUT or PATCH updating the item for aggregate", command);

      if (!command) {
        return res.status(400).json({ message: "Payload is required" });
      }
      console.log ("API -> updating the item")
      const radarItem = await handleRadarItemUpdate(command);

      if (radarItem.success) {
        // Transform the radarItem (original response) for optimistic UI
        console.log ("API -> item updated - ready to send to front-end", radarItem);
      const transformedResponse = {
        success: true,
        message: "Radar item updated successfully",
        data: {
          id: radarItem.aggregateId,
          name: radarItem.payload.name,
          assess: radarItem.payload.assess,
          detect: radarItem.payload.detect,
          respond: radarItem.payload.respond,
          type: radarItem.payload.type,
          impact: radarItem.payload.impact,
          radarId: radarItem.payload.radarId,
          category: radarItem.payload.category,
          distance: radarItem.payload.distance,
          tolerance: radarItem.payload.tolerance,
          zoom_in: radarItem.payload.zoom_in,
          created_at: radarItem.created_at
        }
      };

      // Return the transformed response
      return res.status(201).json(transformedResponse);

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

function transformResponse(originalResponse) {
  return {
    success: originalResponse.success,
    message: originalResponse.message,
    data: {
      id: originalResponse.aggregateId,
      name: originalResponse.payload.name,
      type: originalResponse.payload.type,
      impact: originalResponse.payload.impact,
      radarId: originalResponse.payload.radarId,
      category: originalResponse.payload.category,
      distance: originalResponse.payload.distance,
      tolerance: originalResponse.payload.tolerance,
      createdAt: originalResponse.created_at
    }
  };
}
