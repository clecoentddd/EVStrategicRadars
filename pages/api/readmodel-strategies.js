import {
    getByStreamId,
    getByStrategyId,
    getById,
    getStreamByOrganisationId,
    getAllStreamData,
    getStreamDataFromStreamId,
  } from "../strategies/infrastructure/readModelStreams";
  
  export default async function handler(req, res) {
    const { method, query } = req;
  
    try {
      switch (method) {
        case "GET":
          // Check the query parameters to determine which function to call
          console.log ("API call: GET ", query);
          if (query.stream_id) {
            console.log ("API -> calling getAllstreamData");
            const streamElements = await getAllStreamData(query.stream_id);
            console.log ("API -> calling getAllstreamData returning: ", streamElements);
            res.status(200).json(streamElements);
          } else if (query.stream_aggregate) {
            const streamAggregate = await getStreamDataFromStreamId(query.stream_aggregate);
            res.status(200).json(streamAggregate);
          }  else if (query.strategy_id) {
            const strategyElements = await getByStrategyId(query.strategy_id);
            res.status(200).json(strategyElements);
          } else if (query.id) {
            const element = await getById(query.id);
            res.status(200).json(element);
          } else if (query.radarId) {
            console.log ("Before calling getStreamByOrganisationId : ", query.radarId);
            const streamElement = await getStreamByOrganisationId(query.radarId);
            res.status(200).json(streamElement);
          } else {
            res.status(400).json({ error: "Missing required query parameters." });
          }
          break;
  
        default:
          res.setHeader("Allow", ["GET"]);
          res.status(405).end(`Method ${method} Not Allowed`);
          break;
      }
    } catch (err) {
      console.error("Error in strategic-elements API:", err.message);
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  }
  