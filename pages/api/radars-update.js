import { handleRadarUpdate } from "../radars/model/radarsUpdate"; // Adjust the path if necessary

export default async function updateRadarHandler(req, res) {
  console.log ("updateRadarHandler", req.body);
  try {
    if (req.method === "PUT") {
      // Handle POST request: Create a new radar
      const { radarId, name, description, level } = req.body;

      if (!radarId || !name || !description || typeof level !== "number") {
        return res.status(400).json({ message: "Invalid input" });
      }
      // console.log("api/radars.js: radarsHandler: Received request body:", req.body);
      const command = {
        payload: { radarId, name, description, level },
      };

      console.log ("To implement handleRadarUpdate: ", command.payload);
      const result = await handleRadarUpdate(command);

      if (result.success) {
        // console.log("api/radars.js: result :", result);
        return res.status(201).json({ uuid: result.radar.id, radar: result.radar });
      } else {
        return res.status(409).json({ message: result.message }); // Conflict for duplicate names
      }
    } else {
      // Method not allowed
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("Error in updateRadarHandler:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
