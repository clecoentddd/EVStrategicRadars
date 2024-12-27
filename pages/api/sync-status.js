import { fetchAllRadars } from '../radars/infrastructure/radarsDB'; // Fetch radars from Supabase
import { getEvents } from '../radars/infrastructure/eventStoreCreateRadar'; // Fetch event logs from the event store

export default async function syncStatusHandler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET method is allowed" });
  }

  try {
    // Fetch radars and event logs
    const radars = await fetchAllRadars();
    const events = await getEvents();

    // Extract radar names from both sources for comparison
    const radarNames = radars.map((r) => r.name);
    const eventNames = events
      .filter((e) => e.eventType === 'RADAR_CREATED') // Only consider radar creation events
      .map((e) => e.payload.name);

    // Check if radars are up-to-date
    const missingFromRadars = eventNames.filter((name) => !radarNames.includes(name));
    const isSynced = missingFromRadars.length === 0;

    return res.status(200).json({
      isSynced,
      missingFromRadars, // Radar names that are in the event log but not in the radars table
    });
  } catch (error) {
    console.error("Error checking sync status:", error.message);
    return res.status(500).json({ message: "Failed to check sync status" });
  }
}
