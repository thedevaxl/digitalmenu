import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import jwt from 'jsonwebtoken';
import User from './models/user';

const handler = createRouter<NextApiRequest, NextApiResponse>();

handler.get(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Token is missing' });
  }

  try {
    const decoded: any = jwt.verify(token as string, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
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
