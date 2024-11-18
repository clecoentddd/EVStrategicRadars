import { handleRadarCreation } from "../radars/model/radars"; // Adjust the path if necessary

export default async function createRadar(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST method is allowed" });
  }

  try {
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
  } catch (error) {
    console.error("Error handling radar creation:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
