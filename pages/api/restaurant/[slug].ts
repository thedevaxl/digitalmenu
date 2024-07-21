import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import Restaurant from '../models/restaurant';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  try {
    await connectToDatabase();
    const restaurant = await Restaurant.findOne({ slug: slug as string });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    return res.status(200).json(restaurant);
  } catch (error: any) {
    console.error('Error fetching restaurant:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
