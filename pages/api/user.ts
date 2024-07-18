import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { connectToDatabase } from '../../lib/mongodb';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../lib/jwt';

const handler = createRouter<NextApiRequest, NextApiResponse>();

handler.post(async (req, res) => {
  const { action } = req.query;

  let db, usersCollection;
  try {
    const dbConnection = await connectToDatabase();
    db = dbConnection.db;
    usersCollection = db.collection('users');
  } catch (err) {
    console.error('Failed to connect to the database:', err);
    return res.status(500).json({ message: 'Internal server error', error: 'Failed to connect to the database' });
  }

  switch (action) {
    case 'register':
      await handleRegister(req, res, usersCollection);
      break;
    case 'login':
      await handleLogin(req, res, usersCollection);
      break;
    case 'logout':
      handleLogout(req, res);
      break;
    default:
      res.status(405).json({ message: `Action ${action} not allowed` });
      break;
  }
});

const handleRegister = async (req: NextApiRequest, res: NextApiResponse, usersCollection: any) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    const token = generateToken({ userId: result.insertedId });

    return res.status(201).json({ message: 'User registered', userId: result.insertedId, token });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const handleLogin = async (req: NextApiRequest, res: NextApiResponse, usersCollection: any) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken({ userId: user._id });
    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const handleLogout = (req: NextApiRequest, res: NextApiResponse) => {
  return res.status(200).json({ message: 'Logout successful' });
};

export default handler.handler({
  onError: (err, req, res) => {
    console.error(err);
    res.status(500).end(err.toString());
  },
  onNoMatch: (req, res) => {
    res.status(404).end('Page is not found');
  },
});
