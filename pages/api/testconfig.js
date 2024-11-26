import { getValueDistanceOptions2 } from '../radars/model/testconfigdata';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    console.log (" API Config", getValueDistanceOptions2());
    const config = {
      ...getValueDistanceOptions2(),
      // ... other options
    };
    console.log ("API Config returning config", config);
    res.status(200).json(config);
  }
}