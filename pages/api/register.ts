import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    try {
      const { db } = await connectToDatabase();
      const usersCollection = db.collection('users');

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        res.status(409).json({ message: 'User already exists' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await usersCollection.insertOne({
        name,
        email,
        password: hashedPassword,
        createdAt: new Date(),
      });

      res.status(201).json({ message: 'User registered', userId: result.insertedId });
    } catch (error) {
      console.error('Error registering user:', error);  // Log the error to the server console
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
