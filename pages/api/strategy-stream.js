import { CreateStrategyStream } from '../strategies/model/strategy';

export default async function handler(req, res) {
    console.log ("API Call createStrategyStream API", req.method);
    try {
        if (req.method === 'POST') {
            if (req.url.endsWith('/strategy-stream')) {
                // Handle Create Strategy Stream
                const result = await CreateStrategyStream(req.body);
                return res.status(200).json(result);
            } else {
                return res.status(404).json({ message: 'Not Found' });
            } /*
        } /*else if (req.method === 'GET') {
            console.log("API GET Strategy Stream");
            if (req.url.startsWith('/api/strategy/')) {
                // Extract the ID from the path
                const id = req.url.split('/api/strategy/')[1];
                result = await GetStrategyStreamById(id);
                return res.status(200).json(result);
            } else {
                return res.status(404).json({ message: 'Not Found' });
            } */
        } else {
            res.setHeader('Allow', ['POST', 'GET']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
