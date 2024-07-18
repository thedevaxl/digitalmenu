import type { NextApiRequest, NextApiResponse } from 'next';
import mg from '../../lib/mailgun';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { to, subject, text } = req.body;
    const data = {
      from: `Excited User <me@${process.env.MAILGUN_DOMAIN}>`,
      to,
      subject,
      text,
    };

    mg.messages().send(data, (error, body) => {
      if (error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(200).json(body);
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
