import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { verifyToken } from './jwt';

const tokenBlacklist = new Set<string>();

const jwtMiddleware: NextApiHandler = (req: NextApiRequest, res: NextApiResponse, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ message: 'Unauthorized: Token has been invalidated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    // Attach user information to the request object
    (req as any).user = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token', error: error.message });
  }
};

export default jwtMiddleware;
