import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const DEFAULT_FROM_EMAIL =
  process.env.DEFAULT_FROM_EMAIL ?? 'naoresponda@procemiza.com.br';

type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
};

export async function sendEmail({ to, subject, html, from }: SendEmailParams) {
  const { data, error } = await resend.emails.send({
    from: from ?? DEFAULT_FROM_EMAIL,
    to,
    subject,
    html,
  });

  if (error) {
    console.error('Erro ao enviar e-mail via Resend:', error);
    throw new Error('Falha ao enviar e-mail');
  }

  return data;
}