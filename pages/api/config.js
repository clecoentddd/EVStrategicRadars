import { getValueDistanceOptions } from '../radars/model/configdata';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    console.log (" API Config", getValueDistanceOptions());
    const config = {
      ...getValueDistanceOptions(),
      // ... other options
    };
    console.log ("API Config returning config", config);
    res.status(200).json(config);
  }
}