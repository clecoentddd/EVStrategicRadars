import { handleRadarCreation } from "../radars/model/radars"; // Adjust the path if necessary
import { fetchAllRadars } from "../radars/infrastructure/radarsDB"; // Adjust the path if necessary

export default async function radarsHandler(req, res) {
  try {
    if (req.method === "POST") {
      // Handle POST request: Create a new radar
      const { name, description, level } = req.body;

      if (!name || !description || typeof level !== "number") {
        return res.status(400).json({ message: "Invalid input" });
      }

      const command = {
        payload: { name, description, level },
      };

      const result = await handleRadarCreation(command);

      if (result.success) {
        return res.status(201).json({ uuid: result.uuid, radar: result.radar });
      } else {
        return res.status(409).json({ message: result.message }); // Conflict for duplicate names
      }
    } else if (req.method === "GET") {
      // Handle GET request: Fetch all radars
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
