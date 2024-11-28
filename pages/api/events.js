import { getEvents } from "../radars/infrastructure/eventStore";
import { getRadarById } from "../radars/infrastructure/eventStore"; // Import getRadarById

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { id } = req.query;

    if (id) {
      try {
        const radar = await getRadarByIdFromEventSource(id);
        res.status(200).json({ success: true, radar });
      } catch (error) {
        console.error("Error fetching radar:", error);
        res.status(500).json({ success: false, message: "Error fetching radar" });
      }
    } else {
      const events = await getEvents();
      res.status(200).json({ success: true, events });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  }
}