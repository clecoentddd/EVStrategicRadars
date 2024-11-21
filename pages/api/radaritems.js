import { handleRadarItemCreation } from "../radars/model/radaritems"; 

export default async function radarItemHandler(req, res) {
  if (req.method === "POST") {
    try {
      const { radar_id, name, description, type, category, impact, cost, zoom_in } = req.body;

      // Call radar item creation handler
      const result = await handleRadarItemCreation({
        payload: { radar_id, name, description, type, category, impact, cost, zoom_in },
      });

      // Check the result and respond accordingly
      if (result.success) {
        return res.status(201).json({
          aggregate_id: result.radarItem.aggregate_id, 
          radar_id: result.radarItem.radar_id,
          name: result.radarItem.name,
          description: result.radarItem.description,
          type: result.radarItem.type,
          category: result.radarItem.category,
          impact: result.radarItem.impact,
          cost: result.radarItem.cost,
          zoom_in: result.radarItem.zoom_in,
        });
      } else {
        return res.status(409).json({ message: result.message }); // Conflict for duplicate radar item
      }
    } catch (error) {
      console.error("Error handling radar item creation:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
