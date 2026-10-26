"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { clients } from "@/content/clients";
import "./clients-solutions.css";

function ClientMarks({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul className={`clients-marks${duplicate ? " clients-marks--duplicate" : ""}`} role="list" aria-hidden={duplicate || undefined}>
      {clients.map((client) => (
        <li
          key={client.id}
          className={`client-mark client-mark--${client.id}`}
          style={{ "--logo-width": `${client.displayWidth}px`, "--logo-width-mobile": `${client.mobileDisplayWidth}px` } as CSSProperties}
        >
          <Image
            src={client.image}
            alt={duplicate ? "" : client.alt}
            width={client.width}
            height={client.height}
            sizes={`(max-width: 600px) ${client.mobileDisplayWidth}px, ${client.displayWidth}px`}
          />
        </li>
      ))}
    </ul>
  );
}

export function Clients() {
  const rootRef = useRef<HTMLElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      if (!preference.matches && windowRef.current) windowRef.current.scrollLeft = 0;
      setMotionAllowed(!preference.matches);
    };
    updatePreference();
    preference.addEventListener("change", updatePreference);

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    if (rootRef.current) observer.observe(rootRef.current);
    return () => {
      preference.removeEventListener("change", updatePreference);
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={rootRef} id="clientes" className="clients-strip" aria-labelledby="clients-title" data-animated={motionAllowed} data-paused={paused || !inView}>
      <div className="wrap clients-heading">
        <h2 id="clients-title">Empresas que já trabalham com a Procemiza</h2>
        {motionAllowed && (
          <button type="button" className="clients-motion-toggle" aria-controls="clients-track" onClick={() => setPaused(!paused)}>
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              {paused ? <path d="m5 3 8 5-8 5V3Z" /> : <path d="M4 3h2v10H4zm6 0h2v10h-2z" />}
            </svg>
            <span>{paused ? "Retomar animação" : "Pausar animação"}</span>
          </button>
        )}
      </div>
      <div ref={windowRef} className="clients-window" tabIndex={motionAllowed ? undefined : 0} role="region" aria-label="Logos dos clientes">
        <div id="clients-track" className="clients-track">
          <ClientMarks />
          <ClientMarks duplicate />
        </div>
      </div>
    </section>
  );
}
