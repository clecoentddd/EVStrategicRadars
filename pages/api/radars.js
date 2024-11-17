// pages/api/radars.js (or wherever your API route is)

import { saveEvent } from "../radars/infrastructure/eventStore";  // Adjust the path if necessary

const createRadar = async (req, res) => {
  if (req.method === "POST") {
    const { name, description, level } = req.body.payload;

    const event = {
      type: "CREATE_RADAR",
      payload: { name, description, level },
    };

    try {
      // Save the event and check for duplicates
      await saveEvent(event);
      return res.status(200).json({ success: true, radar: event.payload });
    } catch (error) {
      // Handle error for duplicate radar names
      if (error.message === "Radar name must be unique") {
        return res.status(400).json({ success: false, message: error.message });
      }

      // Handle other unexpected errors
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  } else {
    // Handle unsupported methods (GET, PUT, etc.)
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
};

export default createRadar;
