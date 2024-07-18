import mailgun from 'mailgun-js';

const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY as string, domain: process.env.MAILGUN_DOMAIN as string });

export default mg;
