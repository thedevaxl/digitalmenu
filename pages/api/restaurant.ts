import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import mongoose from 'mongoose';
import connectToDatabase from '../../lib/mongodb';
import { verifyToken } from '../../lib/jwt';
import Restaurant from './models/restaurant';
import { slugify } from '../../utils/slugify';

const handler = createRouter<NextApiRequest, NextApiResponse>();

handler.use(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.user = decoded.userId;
  next();
});

handler.get(async (req, res) => {
  const { slug } = req.query;

  try {
    await connectToDatabase();

    if (slug) {
      // Fetching a single restaurant by slug
      const restaurant = await Restaurant.findOne({ slug: slug as string });

      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }

      return res.status(200).json(restaurant);
    } else {
      // Fetching all restaurants for the authenticated user
      const restaurants = await Restaurant.find({ userId: req.user });
      return res.status(200).json(restaurants);
    }
  } catch (error) {
    console.error('Error fetching restaurant(s):', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

handler.post(async (req, res) => {
  const { name, owner, mobile, workingHours, address, menu } = req.body;

  if (!name || !owner || !mobile || !workingHours || !address || !menu) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await connectToDatabase();

    const slug = slugify(name);

    const newRestaurant = new Restaurant({
      userId: req.user,
      name,
      owner,
      mobile,
      workingHours,
      address,
      menu,
      slug,
    });
    await newRestaurant.save();
    return res.status(201).json({ message: 'Restaurant added', restaurantId: newRestaurant._id });
  } catch (error) {
    console.error('Error adding restaurant:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

handler.put(async (req, res) => {
  const { id, name, owner, mobile, workingHours, address, menu } = req.body;

  if (!id || !name || !owner || !mobile || !workingHours || !address || !menu) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await connectToDatabase();

    const slug = slugify(name);

    const restaurant = await Restaurant.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), userId: req.user },
      { name, owner, mobile, workingHours, address, menu, slug },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    return res.status(200).json({ message: 'Restaurant updated' });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

handler.delete(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await connectToDatabase();

    const restaurant = await Restaurant.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id), userId: req.user });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    return res.status(200).json({ message: 'Restaurant deleted' });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default handler.handler({
  onError: (err, req, res) => {
    console.error(err);
    res.status(500).end((err as Error).toString());
  },
  onNoMatch: (req, res) => {
    res.status(404).end('Page is not found');
  },
});
