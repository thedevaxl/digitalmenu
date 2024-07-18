import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await connectToDatabase();
  const collection = db.collection('data');

  switch (req.method) {
    case 'GET':
      const data = await collection.find({}).toArray();
      res.status(200).json(data);
      break;
    case 'POST':
      const newData = req.body;
      await collection.insertOne(newData);
      res.status(201).json(newData);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
