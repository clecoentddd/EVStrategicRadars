import {
    getStrategicElementsByStreamId,
    getStrategicElementsByStrategyId,
    getStrategicElementById,
  } from "../strategies/infrastructure/readModelStrategicElements";
  
  export default async function handler(req, res) {
    const { method, query } = req;
  
    try {
      switch (method) {
        case "GET":
          // Check the query parameters to determine which function to call
          if (query.stream_id) {
            const streamElements = await getStrategicElementsByStreamId(query.stream_id);
            res.status(200).json(streamElements);
          } else if (query.strategy_id) {
            const strategyElements = await getStrategicElementsByStrategyId(query.strategy_id);
            res.status(200).json(strategyElements);
          } else if (query.id) {
            const element = await getStrategicElementById(query.id);
            res.status(200).json(element);
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
  