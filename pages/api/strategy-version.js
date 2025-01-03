import {GetStrategyById } from '../strategies/model/strategy';
import {createStrategyHandler} from '../strategies/application/strategyHandler';

export default async function handler(req, res) {
    console.log("API Version of Strategy", req.url);
    try {
        if (req.method === 'POST') {
           if (req.url.endsWith('/strategy-version')) {
                // Handle Create New Version of Strategy
                console.log("API CreateStrategy Request Body: ", req.body);
                const result = await createStrategyHandler(req.body);
                return res.status(200).json(result);
            } else {
                return res.status(404).json({ message: 'Not Found' });
            }
        }         if (req.method === 'GET') {
            // Extract id from query parameters
            const { strategy_id, stream_id } = req.query;  // req.query will contain all query parameters
            
            if (!strategy_id || (!stream_id)) {
                return res.status(400).json({ message: 'strategy_id / stream_id are both required' });
            }

            // Assuming you have a function to get items by id
            const result = await GetStrategyById(stream_id, strategy_id); // Your logic to fetch the radar items by id

            if (result) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json({ message: 'Radar items not found' });
            }
        } else {
            res.setHeader('Allow', ['GET']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}   