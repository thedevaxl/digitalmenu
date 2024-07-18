import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { verifyToken } from './jwt';

export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decodedToken = verifyToken(token);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Attach user information to the request object
    req.user = decodedToken;

    return handler(req, res);
  };
}
