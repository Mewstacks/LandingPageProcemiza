"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { GA_ID, getConsentNow } from "./consent";

type Params = Record<string, string | number | boolean>;

/**
 * Só envia com ID configurado e consentimento dado. Nunca passar o texto da
 * rotina (pode conter dado sensível): só categorias e faixas.
 */
export function track(name: string, params: Params = {}) {
  if (!GA_ID || getConsentNow() !== "granted") return;
  sendGAEvent("event", name, params);
}

export function hoursBucket(hours: number): string {
  if (hours < 10) return "<10";
  if (hours < 50) return "10-50";
  if (hours < 200) return "50-200";
  return "200+";
}
