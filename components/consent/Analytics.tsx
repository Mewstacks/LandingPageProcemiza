"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { GA_ID, setConsent, useConsent } from "@/lib/consent";
import "./consent.css";

/** Carrega o GA4 só depois do "Aceitar"; sem ID não renderiza nada. */
export function Analytics() {
  const consent = useConsent();

  useEffect(() => {
    if (!GA_ID || consent !== "granted") return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      if (a.href.startsWith("https://wa.me/")) {
        track("whatsapp_click", { location: a.closest("section[id], header, footer")?.id || a.closest("header, footer")?.tagName.toLowerCase() || "pagina" });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [consent]);

  if (!GA_ID) return null;

  return (
    <>
      {consent === "granted" ? <GoogleAnalytics gaId={GA_ID} /> : null}
      {consent === "unset" ? (
        <section className="consent" aria-label="Cookies">
          <p>Medimos o uso do site com Google Analytics.</p>
          <div>
            <button type="button" className="consent-btn" onClick={() => setConsent("denied")}>Recusar</button>
            <button type="button" className="consent-btn" onClick={() => setConsent("granted")}>Aceitar</button>
          </div>
          <a href="/privacidade">Privacidade</a>
        </section>
      ) : null}
    </>
  );
}

/** Botão do rodapé: reabre a escolha. Sem ID não existe. */
export function CookiePreferences() {
  const consent = useConsent();
  if (!GA_ID || consent === "unknown") return null;
  return (
    <button type="button" className="footer-cookie" onClick={() => setConsent("unset")}>
      Cookies
    </button>
  );
}
