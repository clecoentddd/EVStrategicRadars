import { fetchAllRadars, fetchRadarById } from "../radars/infrastructure/organisationsDB"; // Adjust the path if necessary

export default async function radarsHandler(req, res) {
  console.log("api/organisations-fetch.js: req.body :", req.body);

  try {
    const { id } = req.query; // Extract the id from the query parameters

    if (id) {
      // Fetch a specific radar by its id
      const radar = await fetchRadarById(id);
      if (!radar) {
        return res.status(404).json({ message: "Organisations not found" });
      }
      return res.status(200).json(radar);
    } else {
      // Handle GET request: Fetch all radars if no id is provided
      const radars = await fetchAllRadars();
      return res.status(200).json(radars);
    }
  } catch (error) {
    console.error("Error in radarsHandler:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}