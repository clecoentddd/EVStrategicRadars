import { getEvents } from "../radars/infrastructure/eventStore";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const events = await getEvents();
    res.status(200).json({ success: true, events });
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  }
}
