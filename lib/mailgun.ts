import mailgun from 'mailgun-js';

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY!,
  domain: process.env.MAILGUN_DOMAIN!,
});

interface SendEmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface SendEmailResponse {
  id: string;
  message: string;
}

interface SendEmailError {
  message: string;
}

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: SendEmailParams): Promise<SendEmailResponse | SendEmailError> => {
  const data = {
    from: 'Your App <no-reply@yourdomain.com>',
    to,
    subject,
    text,
    html,
  };

  try {
    const response = await mg.messages().send(data);
    console.log('Email sent successfully:', response);
    return response;
  } catch (error: any) {
    console.error('Error sending email:', error.message);
    return { message: error.message };
  }
};
