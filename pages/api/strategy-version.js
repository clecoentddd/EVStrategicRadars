import { CreateNewVersionOfStrategy, GetStrategyById } from '../strategies/model/strategy';

export default async function handler(req, res) {
    console.log("API Version of Strategy");
    try {
        if (req.method === 'POST') {
           if (req.url.endsWith('/strategy-version')) {
                // Handle Create New Version of Strategy
                console.log("Request Body: ", req.body);
                const result = await CreateNewVersionOfStrategy(req.body);
                return res.status(200).json(result);
            } else {
                return res.status(404).json({ message: 'Not Found' });
            }
        }         if (req.method === 'GET') {
            // Extract aggregate_id from query parameters
            const { aggregate_id } = req.query;  // req.query will contain all query parameters
            
            if (!aggregate_id) {
                return res.status(400).json({ message: 'aggregate_id is required' });
            }

            // Assuming you have a function to get items by aggregate_id
            const result = await GetStrategyById(aggregate_id); // Your logic to fetch the radar items by aggregate_id

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