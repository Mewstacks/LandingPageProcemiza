"use client";

import { useSyncExternalStore } from "react";

export type Consent = "unknown" | "unset" | "granted" | "denied";

const KEY = "procemiza:consent:v1";
const EVENT = "procemiza:consent";

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() || "";

function read(): Exclude<Consent, "unknown"> {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : "unset";
  } catch {
    return "unset";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

/** `unknown` no servidor e na hidratação: nada de mismatch e nada carrega antes da escolha. */
export function useConsent(): Consent {
  return useSyncExternalStore<Consent>(subscribe, read, () => "unknown");
}

export function getConsentNow(): Consent {
  return typeof window === "undefined" ? "unknown" : read();
}

/** Apaga os cookies do GA no host e no domínio-pai. */
function expireGaCookies() {
  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0]?.trim())
    .filter((n): n is string => Boolean(n) && (n === "_ga" || n.startsWith("_ga_") || n === "_gid" || n.startsWith("_gat")));
  const host = window.location.hostname;
  const parts = host.split(".");
  const domains = [host, ...(parts.length > 2 ? [`.${parts.slice(-3).join(".")}`, `.${parts.slice(-2).join(".")}`] : [`.${host}`])];
  for (const name of names) {
    for (const d of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${d}`;
    }
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

export function setConsent(value: "granted" | "denied" | "unset") {
  try {
    if (value === "unset") window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, value);
  } catch {
    /* storage indisponível: vale só nesta página */
  }
  if (value !== "granted" && GA_ID) {
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = true;
    expireGaCookies();
  } else if (GA_ID) {
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = false;
  }
  window.dispatchEvent(new Event(EVENT));
}
