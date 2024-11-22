// pages/api/radaritems.js

import { fetchAllRadarItemsByRadarId } from "../radars/infrastructure/radarItemsDB";  // Import the function to fetch items by radar_id

export default async function handler(req, res) {
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
  } else {
    // Method Not Allowed if the request is not a GET
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
