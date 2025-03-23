import { handleRadarDelete } from "../radars/model/radarsDelete"; // Adjust the path if necessary

export default async function deleteRadarHandler(req, res) {
  console.log ("deleteRadarHandler", req.body);
  try {
    if (req.method === "PUT") {
      // Handle POST request: Create a new radar
      const { radarId } = req.body;

      if (!radarId) {
        return res.status(400).json({ message: "deleteRadarHandler: Invalid input: a radar Id is required" });
      }
      // console.log("api/radars.js: radarsHandler: Received request body:", req.body);
      const command = {
        payload: { radarId},
      };

      console.log ("To implement handleRadarDelete: ", command.payload);
      const result = await handleRadarDelete(command);
      console.log ("To implement - result is in handleRadarDelete: ", result);
      if (result.success) {
        // console.log("api/radars.js: result :", result);
        return res.status(200).json({ message: 'Success - Radar deleted', radar: result.radar });
      } else {
        return res.status(409).json({ message: result.message }); // Conflict for duplicate names
      }
    } else {
      // Method not allowed
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("Error in deleteRadarHandler:", error.message);
    return res.status(500).json({ message: "deleteRadarHandler: Internal Server Error" });
  }
}
