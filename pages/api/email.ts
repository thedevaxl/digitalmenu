import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '../../lib/mailgun';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, and text are required' });
    }

    try {
      const response = await sendEmail({ to, subject, text });
      if ('id' in response) {
        res.status(200).json(response);
      } else {
        res.status(500).json({ error: response.message });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
