import { createStreamFromNewOrganisation } from '../strategies/model/strategy';
import { getStrategiesFromEventSource } from '../strategies/infrastructure/eventStoreStream.js'


export default async function handler(req, res) {
    console.log ("API Call createStreamFromNewOrganisation API", req.method)
    try {
        if (req.method === 'POST') {
            if (req.url.endsWith('/strategy-stream')) {
                // Handle Create Strategy Stream
                const { payload } = req.body;
                console.log ("checking payload before creating stream", payload);
                const result = await createStreamFromNewOrganisation(payload);
                return res.status(200).json(result);
            } else {
                return res.status(404).json({ message: 'Not Found' });
            } 
        } else if (req.method === 'GET') {
            if (req.url.endsWith('/strategy-stream')) {
                // Handle fetching strategies from the event store
                const strategies = await getStrategiesFromEventSource();
                return res.status(200).json(strategies);
            } else {
                return res.status(404).json({ message: 'Not Found' });
            }
        } else {
            res.setHeader('Allow', ['POST', 'GET']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
}