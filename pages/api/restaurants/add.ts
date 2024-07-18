import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongoose';
import RestaurantModel from '../models/restaurant';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, address, openingHours, menu } = req.body;

    if (!name || !address || !openingHours) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    try {
      const { db } = await connectToDatabase();
      const newRestaurant = new RestaurantModel({ name, address, openingHours, menu });
      await newRestaurant.save();
      res.status(201).json({ message: 'Restaurant added', restaurant: newRestaurant });
    } catch (error) {
      console.error('Error adding restaurant:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
