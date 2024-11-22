import { handleRadarCreation } from "../radars/model/radars"; // Adjust the path if necessary
import { fetchAllRadars, fetchRadarById } from "../radars/infrastructure/radarsDB"; // Adjust the path if necessary

export default async function radarsHandler(req, res) {
  try {
    if (req.method === "POST") {
      // Handle POST request: Create a new radar
      const { name, description, level } = req.body;

      if (!name || !description || typeof level !== "number") {
        return res.status(400).json({ message: "Invalid input" });
      }
      console.log("api/radars.js: radarsHandler: Received request body:", req.body);
      const command = {
        payload: { name, description, level },
      };

      const result = await handleRadarCreation(command);

      if (result.success) {
        console.log("api/radars.js: result :", result);
        return res.status(201).json({ uuid: result.radar.aggregate_id, radar: result.radar });
      } else {
        return res.status(409).json({ message: result.message }); // Conflict for duplicate names
      }
    } else if (req.method === "GET") {
      const { aggregate_id } = req.query; // Check if there's a query parameter for aggregate_id

      if (aggregate_id) {
        // Fetch a specific radar by its aggregate_id
        const radar = await fetchRadarById(aggregate_id);
        if (!radar) {
          return res.status(404).json({ message: "Radar not found" });
        }
        return res.status(200).json(radar);
      }

      // Handle GET request: Fetch all radars if no aggregate_id is provided
      const radars = await fetchAllRadars();
      return res.status(200).json(radars);
    } else {
      // Method not allowed
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("Error in radarsHandler:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
