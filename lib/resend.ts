import { Resend } from "resend";

/** Cliente criado na hora do uso: sem a chave, o build e as páginas estáticas não quebram. */
let client: Resend | null = null;

export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  client ??= new Resend(key);
  return client;
}

export const DEFAULT_FROM_EMAIL = process.env.DEFAULT_FROM_EMAIL ?? "Procemiza <relatorio@procemiza.com.br>";
