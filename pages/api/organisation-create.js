import { handleRadarCreation } from "../radars/model/radarsCreate"; // Adjust the path if necessary

export default async function radarsHandler(req, res) {
  console.log("api/radars.js: req.body :", req.body);

  try {
    if (req.method === "POST") {
      // Handle POST request: Create a new radar
      const { name, purpose, context, level } = req.body;

      // Validate input
      if (!name || !purpose || typeof level !== "number") {
        return res.status(400).json({ message: "Invalid input" });
      }

      console.log("api/radars.js: radarsHandler: Received request body:", req.body);

      // Prepare the command for radar creation
      const command = {
        payload: { name, purpose, context, level },
      };

      // Create the radar
      const result = await handleRadarCreation(command);

      // Handle the result
      if (result.success) {
        console.log("api/radars-creation.js: result :", result);
        return res.status(201).json({ message: "Successful", result });
      } else {
        return res.status(409).json({ message: result.message }); // Conflict for duplicate names
      }
    } else {
      // Handle unsupported HTTP methods
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Error in radarsHandler:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}