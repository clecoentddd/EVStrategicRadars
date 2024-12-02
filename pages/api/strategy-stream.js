import { CreateStrategyStream, CreateNewVersionOfStrategy, GetStrategyById } from '../strategies/model/strategy';  // Adjust the path if needed

// Unified handler for all strategy-related requests
export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Handle Create Strategy Stream or Create New Version of Strategy
        if (req.url === '/api/strategy-stream') {
            // Handle Create Strategy Stream
            try {
                const result = await CreateStrategyStream(req.body);
                return res.status(200).json(result);
            } catch (error) {
                return res.status(500).json({ success: false, message: error.message });
            }
        } else if (req.url === '/api/strategy-version') {
            // Handle Create New Version of Strategy
            try {
                const result = await CreateNewVersionOfStrategy(req.body);
                return res.status(200).json(result);
            } catch (error) {
                return res.status(500).json({ success: false, message: error.message });
            }
        }
    } else if (req.method === 'GET') {
        // Handle Get Strategy by ID
        if (req.url.startsWith('/api/strategy/')) {
            const { id } = req.query;  // Extract the id from the query string
            try {
                const result = await GetStrategyById(id);
                return res.status(200).json(result);
            } catch (error) {
                return res.status(500).json({ success: false, message: error.message });
            }
        }
    } else {
        // Return 405 Method Not Allowed if the method is not POST or GET
        res.setHeader('Allow', ['POST', 'GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}
