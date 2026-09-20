import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';
import axios from 'axios';
import config from '../config';
import logger from './logger';

const sesClient = new SESClient({
  region: config.aws_region,
  credentials: {
    accessKeyId: config.aws_access_key_id || '',
    secretAccessKey: config.aws_secret_access_key || '',
  },
});

interface EmailParams {
  to: string | string[];
  subject: string;
  htmlBody: string;
  textBody?: string;
}

const sendViaLocal = async (params: EmailParams): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    ignoreTLS: true,
  });

  await transporter.sendMail({
    from: config.email_from || 'noreply@quran.local',
    to: Array.isArray(params.to) ? params.to.join(', ') : params.to,
    subject: params.subject,
    html: params.htmlBody,
    text: params.textBody,
  });

  logger.info({ to: params.to }, 'Email sent locally');
};

const sendViaGmail = async (params: EmailParams): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.gmail_user,
      pass: config.gmail_password,
    },
  });

  await transporter.sendMail({
    from: config.gmail_user,
    to: Array.isArray(params.to) ? params.to.join(', ') : params.to,
    subject: params.subject,
    html: params.htmlBody,
    text: params.textBody,
  });

  logger.info({ to: params.to }, 'Email sent via Gmail');
};

const sendViaSES = async (params: EmailParams): Promise<void> => {
  const command = new SendEmailCommand({
    Source: config.aws_ses_sender_email!,
    Destination: {
      ToAddresses: Array.isArray(params.to) ? params.to : [params.to],
    },
    Message: {
      Subject: {
        Data: params.subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: params.htmlBody,
          Charset: 'UTF-8',
        },
        Text: params.textBody
          ? {
              Data: params.textBody,
              Charset: 'UTF-8',
            }
          : undefined,
      },
    },
  });

  await sesClient.send(command);
  logger.info({ to: params.to }, 'Email sent via SES');
};

const sendViaBunnyNet = async (params: EmailParams): Promise<void> => {
  await axios.post(
    'https://api.bunny.net/messages/send',
    {
      from: config.bunnynet_email_from,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.htmlBody,
      text: params.textBody,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        AccessKey: config.bunnynet_email_key,
      },
    }
  );

  logger.info({ to: params.to }, 'Email sent via BunnyNet');
};

const sendViaContabo = async (params: EmailParams): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: config.contabo_smtp_host,
    port: Number(config.contabo_smtp_port) || 587,
    secure: false,
    auth: {
      user: config.contabo_smtp_user,
      pass: config.contabo_smtp_password,
    },
  });

  await transporter.sendMail({
    from: config.contabo_email_from,
    to: Array.isArray(params.to) ? params.to.join(', ') : params.to,
    subject: params.subject,
    html: params.htmlBody,
    text: params.textBody,
  });

  logger.info({ to: params.to }, 'Email sent via Contabo');
};

const sendViaBrevo = async (params: EmailParams): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: config.brevo_smtp_host,
    port: Number(config.brevo_smtp_port) || 587,
    secure: false,
    auth: {
      user: config.brevo_smtp_user,
      pass: config.brevo_smtp_password,
    },
  });

  await transporter.sendMail({
    from: config.brevo_email_from,
    to: Array.isArray(params.to) ? params.to.join(', ') : params.to,
    subject: params.subject,
    html: params.htmlBody,
    text: params.textBody,
  });

  logger.info({ to: params.to }, 'Email sent via Brevo');
};

const sendViaMailgun = async (params: EmailParams): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: config.mailgun_smtp_host,
    port: Number(config.mailgun_smtp_port) || 587,
    secure: false,
    auth: {
      user: config.mailgun_smtp_user,
      pass: config.mailgun_smtp_password,
    },
  });

  await transporter.sendMail({
    from: config.mailgun_email_from,
    to: Array.isArray(params.to) ? params.to.join(', ') : params.to,
    subject: params.subject,
    html: params.htmlBody,
    text: params.textBody,
  });

  logger.info({ to: params.to }, 'Email sent via Mailgun');
};

const sendViaEthereal = async (params: EmailParams): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: config.ethereal_host,
    port: Number(config.ethereal_port) || 587,
    secure: false,
    auth: {
      user: config.ethereal_user,
      pass: config.ethereal_password,
    },
  });

  await transporter.sendMail({
    from: config.ethereal_user,
    to: Array.isArray(params.to) ? params.to.join(', ') : params.to,
    subject: params.subject,
    html: params.htmlBody,
    text: params.textBody,
  });

  logger.info({ to: params.to }, 'Email sent via Ethereal');
};

export const sendEmail = async (to: string, htmlBody: string, subject: string = 'Notification', _textBody?: string): Promise<void> => {
  try {
    const provider = config.email_provider || 'local';
    const params: EmailParams = { to, subject, htmlBody };

    if (provider === 'local') {
      await sendViaLocal(params);
      return;
    }

    if (provider === 'gmail') {
      await sendViaGmail(params);
      return;
    }

    if (provider === 'ses') {
      await sendViaSES(params);
      return;
    }

    if (provider === 'bunnynet') {
      await sendViaBunnyNet(params);
      return;
    }

    if (provider === 'contabo') {
      await sendViaContabo(params);
      return;
    }

    if (provider === 'brevo') {
      await sendViaBrevo(params);
      return;
    }

    if (provider === 'mailgun') {
      await sendViaMailgun(params);
      return;
    }

    if (provider === 'ethereal') {
      await sendViaEthereal(params);
      return;
    }

    throw new Error(`Invalid email provider: ${provider}`);
  } catch (error) {
    logger.error({ error }, `Failed to send email via ${config.email_provider}`);
    throw new Error('Failed to send email');
  }
};

export const sendBulkEmail = async (to: string | string[], subject: string, htmlBody: string, _textBody?: string): Promise<void> => {
  await sendEmail(Array.isArray(to) ? to[0] : to, htmlBody, subject);
};

export const sendPasswordResetEmail = async (email: string, resetLink: string): Promise<void> => {
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <p><a href="${resetLink}" class="button">Reset Password</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p>${resetLink}</p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, htmlBody, 'Password Reset Request');
};

export const sendWelcomeEmail = async (email: string, userName: string): Promise<void> => {
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
      <h2>Welcome to Maps Platform!</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for joining our navigation and road-intelligence platform. We're excited to have you on board!</p>
      <p>Get started by exploring the map, setting up your vehicle profile, and discovering what's happening on the roads ahead.</p>
      <p>Best regards,<br>The Maps Team</p>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, htmlBody, 'Welcome to Maps Platform');
};


